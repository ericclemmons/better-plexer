#!/usr/bin/env node

/**
 * PTY WebSocket Server for Better Plexer Sandbox
 * Based on ghostty-web demo server pattern
 */

import http from 'http';
import fs from 'fs';
import path from 'path';
import { homedir, tmpdir } from 'os';
import pty from '@lydell/node-pty';
import { WebSocketServer } from 'ws';

const PORT = process.env.PORT || 7681;
const sessions = new Map();

function getShell() {
  return process.env.SHELL || '/bin/bash';
}

function createPtySession(cols, rows) {
  const shell = getShell();

  const ptyProcess = pty.spawn(shell, [], {
    name: 'xterm-256color',
    cols: cols,
    rows: rows,
    cwd: homedir(),
    env: {
      ...process.env,
      TERM: 'xterm-256color',
      COLORTERM: 'truecolor',
    },
  });

  return ptyProcess;
}

// Simple HTTP server (just for health checks)
const httpServer = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', sessions: sessions.size }));
    return;
  }
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('PTY Server - connect via WebSocket at /ws');
});

// WebSocket server attached to HTTP server
const wss = new WebSocketServer({ noServer: true });

// Handle HTTP upgrade for WebSocket connections
// Accept any path since Cloudflare sandbox proxies the original request path
httpServer.on('upgrade', (req, socket, head) => {
  wss.handleUpgrade(req, socket, head, (ws) => {
    wss.emit('connection', ws, req);
  });
});

wss.on('connection', (ws, req) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const cols = Number.parseInt(url.searchParams.get('cols') || '80');
  const rows = Number.parseInt(url.searchParams.get('rows') || '24');

  console.log(`[PTY] New connection: ${cols}x${rows}`);

  // Create PTY
  const ptyProcess = createPtySession(cols, rows);
  sessions.set(ws, { pty: ptyProcess });

  // PTY -> WebSocket
  ptyProcess.onData((data) => {
    if (ws.readyState === ws.OPEN) {
      ws.send(data);
    }
  });

  ptyProcess.onExit(({ exitCode }) => {
    console.log(`[PTY] Shell exited: ${exitCode}`);
    if (ws.readyState === ws.OPEN) {
      ws.send(`\r\n\x1b[33mShell exited (code: ${exitCode})\x1b[0m\r\n`);
      ws.close();
    }
  });

  // WebSocket -> PTY
  ws.on('message', (data) => {
    const message = data.toString('utf8');

    // Check for JSON messages (resize, image, etc.)
    if (message.startsWith('{')) {
      try {
        const msg = JSON.parse(message);
        if (msg.type === 'resize') {
          console.log(`[PTY] Resize: ${msg.cols}x${msg.rows}`);
          ptyProcess.resize(msg.cols, msg.rows);
          return; // Don't write to PTY
        }
        if (msg.type === 'image' && msg.data) {
          // Handle image drop/paste - save to temp file and insert path
          const imageDir = path.join(tmpdir(), 'plexer-images');
          if (!fs.existsSync(imageDir)) {
            fs.mkdirSync(imageDir, { recursive: true });
          }

          // Extract base64 data (remove data URL prefix if present)
          let base64Data = msg.data;
          let ext = 'png';
          const match = msg.data.match(/^data:image\/(\w+);base64,(.+)$/);
          if (match) {
            ext = match[1] === 'jpeg' ? 'jpg' : match[1];
            base64Data = match[2];
          }

          // Generate unique filename
          const baseName = (msg.name || 'image').replace(/\.[^.]+$/, '');
          const filename = `${baseName}-${Date.now()}.${ext}`;
          const filepath = path.join(imageDir, filename);

          // Write the image file
          fs.writeFileSync(filepath, Buffer.from(base64Data, 'base64'));
          console.log(`[PTY] Saved image: ${filepath}`);

          // Insert the file path into the terminal (so user can reference it)
          ptyProcess.write(filepath);
          return; // Don't write raw JSON to PTY
        }
        // Unknown JSON message type - don't write to PTY
        console.log(`[PTY] Unknown message type: ${msg.type}`);
        return;
      } catch (e) {
        // Not valid JSON, fall through to treat as raw input
      }
    }

    // Send raw input to PTY
    ptyProcess.write(message);
  });

  ws.on('close', () => {
    console.log('[PTY] Connection closed');
    const session = sessions.get(ws);
    if (session) {
      session.pty.kill();
      sessions.delete(ws);
    }
  });

  ws.on('error', (err) => {
    console.error('[PTY] WebSocket error:', err.message);
  });
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n[PTY] Shutting down...');
  for (const [ws, session] of sessions.entries()) {
    session.pty.kill();
    ws.close();
  }
  wss.close();
  httpServer.close();
  process.exit(0);
});

process.on('SIGTERM', () => {
  process.emit('SIGINT');
});

// Start server
httpServer.listen(PORT, '0.0.0.0', () => {
  console.log(`[PTY] Server listening on port ${PORT}`);
  console.log(`[PTY] Shell: ${getShell()}`);
  console.log(`[PTY] Home: ${homedir()}`);
});
