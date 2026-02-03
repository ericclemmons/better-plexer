import type { Session, SessionEvent, SandboxInstance } from '../types';

interface WebSocketSession {
  webSocket: WebSocket;
  sessionId: string;
}

/**
 * Durable Object for coordinating real-time session updates
 * Handles WebSocket connections for terminal streaming and status updates
 */
export class SessionCoordinator implements DurableObject {
  private sessions: Map<string, WebSocketSession> = new Map();
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

    // Store the connection
    const id = crypto.randomUUID();
    this.sessions.set(id, { webSocket: server, sessionId });

    // Handle messages from this WebSocket
    server.addEventListener('message', async (event) => {
      try {
        const message = JSON.parse(event.data as string);
        await this.handleMessage(id, message);
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

  private async handleMessage(connectionId: string, message: unknown): Promise<void> {
    // Handle incoming messages from connected clients
    // For now, we just broadcast terminal output or status updates
    if (typeof message === 'object' && message !== null && 'type' in message) {
      const event = message as SessionEvent;
      await this.broadcastToSession(event.sessionId, event);
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
    // This will be implemented when Sandbox API is available
    // For now, return a placeholder
    const body = await request.json() as { sessionId: string; type: 'primary' | 'validation' };

    const sandbox: SandboxInstance = {
      id: crypto.randomUUID(),
      sessionId: body.sessionId,
      type: body.type,
      status: 'creating',
      createdAt: Date.now(),
      lastActiveAt: Date.now(),
    };

    // Store sandbox state
    await this.state.storage.put(`sandbox:${sandbox.id}`, sandbox);

    return new Response(JSON.stringify({ success: true, data: sandbox }), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  private async handleSandboxExecute(request: Request): Promise<Response> {
    // This will execute commands in a sandbox when API is available
    const body = await request.json() as { sandboxId: string; command: string };

    // For now, return a placeholder response
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
