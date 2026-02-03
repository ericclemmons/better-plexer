import { Hono } from 'hono';
import { getSandbox, proxyToSandbox, Sandbox } from '@cloudflare/sandbox';
import type { Env, Session, ApiResponse } from './types';
import { renderDashboard, renderSessionDetail } from './ui/templates';
import { SessionCoordinator } from './durable-objects/session-coordinator';

// Re-export Durable Object classes for Wrangler
export { SessionCoordinator, Sandbox };

const app = new Hono<{ Bindings: Env }>();

// Handle sandbox preview URLs
app.use('*', async (c, next) => {
  const proxyResponse = await proxyToSandbox(c.req.raw, c.env);
  if (proxyResponse) return proxyResponse;
  return next();
});

// Static assets are served automatically via Wrangler's [assets] configuration

// API Routes
app.get('/api/sessions', async (c) => {
  const sessions = await listSessions(c.env);
  return c.json<ApiResponse<Session[]>>({ success: true, data: sessions });
});

app.post('/api/sessions', async (c) => {
  const body = await c.req.json();
  const session = await createSession(c.env, body);
  return c.json<ApiResponse<Session>>({ success: true, data: session }, 201);
});

app.get('/api/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const session = await getSession(c.env, id);
  if (!session) {
    return c.json<ApiResponse<never>>({ success: false, error: 'Session not found' }, 404);
  }
  return c.json<ApiResponse<Session>>({ success: true, data: session });
});

app.patch('/api/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const updates = await c.req.json();
  const session = await updateSession(c.env, id, updates);
  if (!session) {
    return c.json<ApiResponse<never>>({ success: false, error: 'Session not found' }, 404);
  }
  return c.json<ApiResponse<Session>>({ success: true, data: session });
});

app.delete('/api/sessions/:id', async (c) => {
  const id = c.req.param('id');
  await deleteSession(c.env, id);
  return c.json<ApiResponse<void>>({ success: true });
});

// UI Routes
app.get('/', async (c) => {
  const sessions = await listSessions(c.env);
  return c.html(renderDashboard(sessions));
});

app.get('/sessions/:id', async (c) => {
  const id = c.req.param('id');
  const [session, allSessions] = await Promise.all([
    getSession(c.env, id),
    listSessions(c.env),
  ]);
  if (!session) {
    return c.redirect('/');
  }
  return c.html(renderSessionDetail(session, allSessions));
});

// Execute command in sandbox
app.post('/api/sessions/:id/exec', async (c) => {
  const id = c.req.param('id');
  const session = await getSession(c.env, id);
  if (!session) {
    return c.json<ApiResponse<never>>({ success: false, error: 'Session not found' }, 404);
  }

  const { command } = await c.req.json() as { command: string };

  try {
    // Get sandbox for this session
    const sandbox = getSandbox(c.env.Sandbox, `session-${id}`);
    const result = await sandbox.exec(command);

    return c.json({
      success: result.success,
      data: {
        stdout: result.stdout,
        stderr: result.stderr,
        exitCode: result.exitCode,
      },
    });
  } catch (error) {
    return c.json<ApiResponse<never>>({
      success: false,
      error: error instanceof Error ? error.message : 'Sandbox execution failed',
    }, 500);
  }
});

// WebSocket endpoint for terminal - proxies to PTY server in sandbox
app.get('/api/sessions/:id/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade');
  if (upgradeHeader !== 'websocket') {
    return c.text('Expected WebSocket', 426);
  }

  const id = c.req.param('id');
  const session = await getSession(c.env, id);
  if (!session) {
    return c.text('Session not found', 404);
  }

  try {
    // Get sandbox for this session
    const sandbox = getSandbox(c.env.Sandbox, `session-${id}`);

    // Ensure PTY server is running (exec is fire-and-forget, will not block if already running)
    await sandbox.exec('pgrep -f "node.*pty-server" || (cd /opt/pty-server && node pty-server.mjs > /tmp/pty.log 2>&1 &)');

    // Proxy WebSocket connection to sandbox PTY server using wsConnect
    // Per https://developers.cloudflare.com/sandbox/guides/websocket-connections/
    return await sandbox.wsConnect(c.req.raw, 7681);
  } catch (error) {
    console.error('Terminal WebSocket error:', error);
    return c.text(error instanceof Error ? error.message : 'Unknown error', 500);
  }
});

// Helper functions
async function listSessions(env: Env): Promise<Session[]> {
  const list = await env.SESSIONS.list({ prefix: 'session:' });
  const sessions: Session[] = [];

  for (const key of list.keys) {
    const data = await env.SESSIONS.get(key.name, 'json');
    if (data) {
      sessions.push(data as Session);
    }
  }

  // Sort by most recently updated
  sessions.sort((a, b) => b.updatedAt - a.updatedAt);
  return sessions;
}

async function getSession(env: Env, id: string): Promise<Session | null> {
  return await env.SESSIONS.get(`session:${id}`, 'json');
}

async function createSession(env: Env, input: Partial<Session>): Promise<Session> {
  const id = crypto.randomUUID();
  const now = Date.now();

  const session: Session = {
    id,
    name: input.name || 'New Session',
    description: input.description,
    status: input.status || 'idle',
    agent: input.agent || 'claude-code',
    taskId: input.taskId,
    taskSource: input.taskSource,
    repos: input.repos || [],
    validationSandboxes: [],
    createdAt: now,
    updatedAt: now,
    startedAt: input.startedAt,
  };

  await env.SESSIONS.put(`session:${id}`, JSON.stringify(session));
  return session;
}

async function updateSession(env: Env, id: string, updates: Partial<Session>): Promise<Session | null> {
  const session = await getSession(env, id);
  if (!session) return null;

  const updated: Session = {
    ...session,
    ...updates,
    id, // Prevent ID from being changed
    updatedAt: Date.now(),
  };

  await env.SESSIONS.put(`session:${id}`, JSON.stringify(updated));
  return updated;
}

async function deleteSession(env: Env, id: string): Promise<void> {
  await env.SESSIONS.delete(`session:${id}`);
}

export default app;
