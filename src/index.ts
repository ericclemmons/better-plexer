import { Hono } from 'hono';
import type { Env, Session, ApiResponse } from './types';
import { renderDashboard, renderSessionDetail } from './ui/templates';
import { SessionCoordinator } from './durable-objects/session-coordinator';

// Re-export for Wrangler
export { SessionCoordinator };

const app = new Hono<{ Bindings: Env }>();

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
  const session = await getSession(c.env, id);
  if (!session) {
    return c.redirect('/');
  }
  return c.html(renderSessionDetail(session));
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
    status: 'idle',
    agent: input.agent || 'claude-code',
    taskId: input.taskId,
    taskSource: input.taskSource,
    repos: input.repos || [],
    validationSandboxes: [],
    createdAt: now,
    updatedAt: now,
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
