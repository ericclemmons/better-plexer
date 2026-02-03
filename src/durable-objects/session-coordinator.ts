import type { SessionEvent, SandboxInstance } from '../types';

interface TerminalSession {
  webSocket: WebSocket;
  sessionId: string;
  inputBuffer: string;
  cwd: string;
}

/**
 * Durable Object for coordinating real-time session updates
 * Handles WebSocket connections for terminal streaming and status updates
 */
export class SessionCoordinator implements DurableObject {
  private sessions: Map<string, TerminalSession> = new Map();
  private state: DurableObjectState;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // WebSocket upgrade for real-time updates
    if (request.headers.get('Upgrade') === 'websocket') {
      return this.handleWebSocket(request);
    }

    // HTTP endpoints for session coordination
    if (path === '/broadcast' && request.method === 'POST') {
      return this.handleBroadcast(request);
    }

    if (path === '/sandbox/create' && request.method === 'POST') {
      return this.handleSandboxCreate(request);
    }

    if (path === '/sandbox/execute' && request.method === 'POST') {
      return this.handleSandboxExecute(request);
    }

    return new Response('Not found', { status: 404 });
  }

  private async handleWebSocket(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return new Response('Missing sessionId', { status: 400 });
    }

    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);

    // Accept the WebSocket
    this.state.acceptWebSocket(server);

    // Store the connection with terminal state
    const id = crypto.randomUUID();
    this.sessions.set(id, {
      webSocket: server,
      sessionId,
      inputBuffer: '',
      cwd: '/workspace',
    });

    // Handle messages from this WebSocket
    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        await this.handleTerminalInput(id, message);
      } catch (error) {
        console.error('WebSocket message error:', error);
      }
    });

    // Clean up on close
    server.addEventListener('close', () => {
      this.sessions.delete(id);
    });

    return new Response(null, { status: 101, webSocket: client });
  }

  private async handleTerminalInput(connectionId: string, message: { type: string; data?: string }): Promise<void> {
    const session = this.sessions.get(connectionId);
    if (!session || session.webSocket.readyState !== WebSocket.OPEN) return;

    if (message.type === 'input' && message.data) {
      const input = message.data;

      // Handle special characters
      for (const char of input) {
        if (char === '\r' || char === '\n') {
          // Execute command
          session.webSocket.send(JSON.stringify({ type: 'output', data: '\r\n' }));
          await this.executeCommand(session, session.inputBuffer.trim());
          session.inputBuffer = '';
          // Show new prompt
          session.webSocket.send(JSON.stringify({
            type: 'output',
            data: `\x1b[90m${session.cwd} $\x1b[0m `,
          }));
        } else if (char === '\x7f' || char === '\b') {
          // Backspace
          if (session.inputBuffer.length > 0) {
            session.inputBuffer = session.inputBuffer.slice(0, -1);
            session.webSocket.send(JSON.stringify({ type: 'output', data: '\b \b' }));
          }
        } else if (char === '\x03') {
          // Ctrl+C
          session.inputBuffer = '';
          session.webSocket.send(JSON.stringify({ type: 'output', data: '^C\r\n' }));
          session.webSocket.send(JSON.stringify({
            type: 'output',
            data: `\x1b[90m${session.cwd} $\x1b[0m `,
          }));
        } else if (char >= ' ') {
          // Regular character
          session.inputBuffer += char;
          session.webSocket.send(JSON.stringify({ type: 'output', data: char }));
        }
      }
    }
  }

  private async executeCommand(session: TerminalSession, command: string): Promise<void> {
    if (!command) return;

    const [cmd, ...args] = command.split(/\s+/);
    const ws = session.webSocket;
    const send = (text: string) => ws.send(JSON.stringify({ type: 'output', data: text }));

    switch (cmd) {
      case 'help':
        send('\x1b[36mAvailable commands:\x1b[0m\r\n');
        send('  help     - Show this help\r\n');
        send('  ls       - List files\r\n');
        send('  pwd      - Print working directory\r\n');
        send('  cd       - Change directory\r\n');
        send('  echo     - Print text\r\n');
        send('  clear    - Clear screen\r\n');
        send('  whoami   - Show current user\r\n');
        send('  date     - Show current date\r\n');
        send('  claude   - Start Claude Code (simulated)\r\n');
        send('  opencode - Start OpenCode (simulated)\r\n');
        send('\r\n\x1b[33mNote: This is a mock shell. Real sandbox coming soon.\x1b[0m\r\n');
        break;

      case 'ls':
        send('\x1b[34mrepos/\x1b[0m  \x1b[34m.config/\x1b[0m  SKILLS.md  README.md\r\n');
        break;

      case 'pwd':
        send(session.cwd + '\r\n');
        break;

      case 'cd':
        if (args[0]) {
          if (args[0] === '..') {
            const parts = session.cwd.split('/').filter(Boolean);
            parts.pop();
            session.cwd = '/' + parts.join('/') || '/';
          } else if (args[0].startsWith('/')) {
            session.cwd = args[0];
          } else {
            session.cwd = session.cwd + '/' + args[0];
          }
        }
        break;

      case 'echo':
        send(args.join(' ') + '\r\n');
        break;

      case 'clear':
        send('\x1b[2J\x1b[H');
        break;

      case 'whoami':
        send('plexer\r\n');
        break;

      case 'date':
        send(new Date().toISOString() + '\r\n');
        break;

      case 'claude':
      case 'opencode':
      case 'codex':
        send(`\x1b[32mStarting ${cmd}...\x1b[0m\r\n`);
        send('\r\n');
        send('\x1b[1m  ╭──────────────────────────────────────╮\x1b[0m\r\n');
        send('\x1b[1m  │\x1b[0m  \x1b[36m' + cmd.toUpperCase() + '\x1b[0m - AI Coding Assistant     \x1b[1m│\x1b[0m\r\n');
        send('\x1b[1m  │\x1b[0m                                      \x1b[1m│\x1b[0m\r\n');
        send('\x1b[1m  │\x1b[0m  \x1b[33mSandbox integration coming soon\x1b[0m     \x1b[1m│\x1b[0m\r\n');
        send('\x1b[1m  │\x1b[0m  This will connect to Cloudflare     \x1b[1m│\x1b[0m\r\n');
        send('\x1b[1m  │\x1b[0m  Sandbox for real execution.         \x1b[1m│\x1b[0m\r\n');
        send('\x1b[1m  ╰──────────────────────────────────────╯\x1b[0m\r\n');
        send('\r\n');
        break;

      case 'cat':
        if (args[0] === 'SKILLS.md') {
          send('\x1b[36m# Better Plexer Agent Skills\x1b[0m\r\n\r\n');
          send('Instructions for AI agents operating in this sandbox...\r\n');
          send('\x1b[90m(truncated)\x1b[0m\r\n');
        } else if (args[0] === 'README.md') {
          send('\x1b[36m# Better Plexer\x1b[0m\r\n\r\n');
          send('A cloud-native chat multiplexer for AI coding sessions.\r\n');
        } else {
          send(`\x1b[31mcat: ${args[0] || 'missing file'}: No such file\x1b[0m\r\n`);
        }
        break;

      default:
        send(`\x1b[31m${cmd}: command not found\x1b[0m\r\n`);
        send('\x1b[90mType "help" for available commands\x1b[0m\r\n');
    }
  }

  private async broadcastToSession(sessionId: string, event: SessionEvent): Promise<void> {
    const message = JSON.stringify(event);

    for (const [, session] of this.sessions) {
      if (session.sessionId === sessionId && session.webSocket.readyState === WebSocket.OPEN) {
        session.webSocket.send(message);
      }
    }
  }

  private async handleBroadcast(request: Request): Promise<Response> {
    try {
      const event = (await request.json()) as SessionEvent;
      await this.broadcastToSession(event.sessionId, event);
      return new Response(JSON.stringify({ success: true }), {
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      return new Response(JSON.stringify({ success: false, error: String(error) }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  }

  private async handleSandboxCreate(request: Request): Promise<Response> {
    const body = await request.json() as { sessionId: string; type: 'primary' | 'validation' };

    const sandbox: SandboxInstance = {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      type: body.type,
      status: 'creating',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    await this.state.storage.put(`sandbox:${sandbox.id}`, sandbox);

    return new Response(JSON.stringify({ success: true, data: sandbox }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleSandboxExecute(request: Request): Promise<Response> {
    const body = await request.json() as { sandboxId: string; command: string };

    return new Response(
      JSON.stringify({
        success: true,
        data: {
          sandboxId: body.sandboxId,
          command: body.command,
          output: 'Sandbox execution not yet implemented',
          exitCode: 0,
        },
      }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  }
}
