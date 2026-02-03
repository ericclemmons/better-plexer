import type { Session } from '../types';

// Icons as SVG strings
const icons = {
  logo: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M12 2L2 7l10 5 10-5-10-5z"/>
    <path d="M2 17l10 5 10-5"/>
    <path d="M2 12l10 5 10-5"/>
  </svg>`,
  plus: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"/>
    <line x1="5" y1="12" x2="19" y2="12"/>
  </svg>`,
  terminal: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="4 17 10 11 4 5"/>
    <line x1="12" y1="19" x2="20" y2="19"/>
  </svg>`,
  git: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="18" cy="18" r="3"/>
    <circle cx="6" cy="6" r="3"/>
    <path d="M13 6h3a2 2 0 0 1 2 2v7"/>
    <line x1="6" y1="9" x2="6" y2="21"/>
  </svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,
  play: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polygon points="5 3 19 12 5 21 5 3"/>
  </svg>`,
  pause: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="6" y="4" width="4" height="16"/>
    <rect x="14" y="4" width="4" height="16"/>
  </svg>`,
  stop: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
  </svg>`,
  refresh: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="23 4 23 10 17 10"/>
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
  </svg>`,
};

function formatTimeAgo(timestamp: number): string {
  const seconds = Math.floor((Date.now() - timestamp) / 1000);
  if (seconds < 60) return 'now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  return `${days}d`;
}

function getAgentEmoji(agent: Session['agent']): string {
  switch (agent) {
    case 'claude-code': return '🤖';
    case 'opencode': return '⚡';
    case 'codex': return '🧠';
    default: return '🔧';
  }
}

function renderSessionItem(session: Session, isActive: boolean): string {
  return `
    <a href="/sessions/${session.id}" class="session-item ${isActive ? 'active' : ''}" data-session-id="${session.id}">
      <div class="session-item-indicator ${session.status}"></div>
      <div class="session-item-content">
        <div class="session-item-name">${session.name}</div>
        <div class="session-item-meta">
          <span>${getAgentEmoji(session.agent)}</span>
          ${session.taskId ? `<span class="session-item-task">${session.taskId}</span>` : ''}
          <span>${formatTimeAgo(session.updatedAt)}</span>
        </div>
      </div>
    </a>
  `;
}

function renderSidebar(sessions: Session[], activeSessionId?: string): string {
  const running = sessions.filter(s => s.status === 'running' || s.status === 'starting' || s.status === 'validating');
  const recent = sessions.filter(s => !running.includes(s)).slice(0, 10);

  return `
    <aside class="sidebar">
      <div class="sidebar-header">
        <a href="/" class="logo">
          <div class="logo-icon">${icons.logo}</div>
          <span>Plexer</span>
        </a>
        <button class="btn btn-ghost btn-icon" title="Settings">
          ${icons.settings}
        </button>
      </div>

      <div class="sessions-list">
        ${running.length > 0 ? `
          <div class="sessions-section">
            <div class="sessions-section-title">Active</div>
            ${running.map(s => renderSessionItem(s, s.id === activeSessionId)).join('')}
          </div>
        ` : ''}

        <div class="sessions-section">
          <div class="sessions-section-title">Recent</div>
          ${recent.length > 0
            ? recent.map(s => renderSessionItem(s, s.id === activeSessionId)).join('')
            : '<div class="session-item"><div class="session-item-content"><div class="session-item-name text-muted">No sessions yet</div></div></div>'
          }
        </div>
      </div>

      <div class="sidebar-footer">
        <button class="new-session-btn" onclick="quickCreateSession()">
          ${icons.plus}
          <span>New Session</span>
        </button>
      </div>
    </aside>
  `;
}

// Modal removed - using quick create instead

function baseLayout(content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Better Plexer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  ${content}
  <script>
    ${clientScript}
  </script>
</body>
</html>`;
}

export function renderDashboard(sessions: Session[]): string {
  const content = `
    <div class="app">
      ${renderSidebar(sessions)}
      <main class="main-content">
        <div class="empty-main">
          <div class="empty-main-icon">${icons.terminal}</div>
          <h2 class="empty-main-title">Select a session</h2>
          <p class="empty-main-description">
            Choose a session from the sidebar or create a new one to start working with your AI coding assistant.
          </p>
          <button class="btn btn-primary" onclick="openNewSessionModal()">
            ${icons.plus}
            New Session
          </button>
        </div>
      </main>
          </div>
  `;

  return baseLayout(content);
}

export function renderSessionDetail(session: Session, allSessions: Session[]): string {
  const repoTags = session.repos.map(repo => `
    <span class="repo-tag">
      ${icons.git}
      <span>${repo.repoUrl.split('/').pop()}</span>
      <span class="branch">${repo.branch}</span>
    </span>
  `).join('');

  const content = `
    <div class="app">
      ${renderSidebar(allSessions, session.id)}
      <main class="main-content">
        <div class="main-header">
          <div class="main-header-left">
            <span class="main-header-title">${session.name}</span>
            ${session.taskId ? `<span class="session-item-task">${session.taskId}</span>` : ''}
            <span class="status-badge ${session.status}">${session.status}</span>
            ${session.repos.length > 0 ? `<div class="repo-tags">${repoTags}</div>` : ''}
          </div>
          <div class="main-header-right">
            ${session.status === 'running'
              ? `<button class="btn btn-secondary" onclick="pauseSession('${session.id}')">${icons.pause}</button>`
              : `<button class="btn btn-primary" onclick="startSession('${session.id}')">${icons.play} Start</button>`
            }
            <button class="btn btn-ghost btn-icon" onclick="reconnectTerminal()" title="Reconnect">
              ${icons.refresh}
            </button>
          </div>
        </div>

        <div class="terminal-area">
          <div class="terminal-wrapper">
            <div class="terminal-container" id="terminal"></div>
          </div>
          <div class="terminal-statusbar">
            <span class="terminal-status" id="terminalStatus">Connecting...</span>
            <span class="text-mono text-xs">${session.agent}</span>
          </div>
        </div>
      </main>
          </div>

    <script type="module">
      ${terminalScript(session.id)}
    </script>
  `;

  return baseLayout(content);
}

function terminalScript(sessionId: string): string {
  return `
    import { init, Terminal, FitAddon } from 'https://esm.sh/ghostty-web@0.4.0';

    let terminal = null;
    let fitAddon = null;
    let ws = null;

    async function initTerminal() {
      const container = document.getElementById('terminal');
      const statusEl = document.getElementById('terminalStatus');

      try {
        statusEl.textContent = 'Loading...';
        statusEl.className = 'terminal-status connecting';

        await init();

        terminal = new Terminal({
          fontSize: 14,
          fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
          theme: {
            background: '#0a0a0f',
            foreground: '#f4f4f5',
            cursor: '#6366f1',
            cursorAccent: '#0a0a0f',
            selection: 'rgba(99, 102, 241, 0.3)',
            black: '#27272a',
            red: '#ef4444',
            green: '#22c55e',
            yellow: '#f59e0b',
            blue: '#3b82f6',
            magenta: '#8b5cf6',
            cyan: '#06b6d4',
            white: '#f4f4f5',
            brightBlack: '#52525b',
            brightRed: '#f87171',
            brightGreen: '#4ade80',
            brightYellow: '#fbbf24',
            brightBlue: '#60a5fa',
            brightMagenta: '#a78bfa',
            brightCyan: '#22d3ee',
            brightWhite: '#ffffff',
          }
        });

        // Load FitAddon to auto-fit terminal to container
        fitAddon = new FitAddon();
        terminal.loadAddon(fitAddon);

        await terminal.open(container);

        // Fit terminal to container and auto-resize
        fitAddon.fit();
        fitAddon.observeResize();

        connectWebSocket();

        // Send input to WebSocket (raw data)
        terminal.onData((data) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(data);
          }
        });

        // Drag and drop support for images
        setupDragAndDrop(container);

        // Handle terminal resize - notify server of new dimensions
        terminal.onResize?.(({ cols, rows }) => {
          if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ type: 'resize', cols, rows }));
          }
        });

      } catch (error) {
        console.error('Terminal init failed:', error);
        statusEl.textContent = 'Failed';
        statusEl.className = 'terminal-status error';
        container.innerHTML = '<div class="terminal-error">' + error.message + '</div>';
      }
    }

    async function connectWebSocket() {
      const statusEl = document.getElementById('terminalStatus');
      const cols = terminal?.cols || 80;
      const rows = terminal?.rows || 24;

      statusEl.textContent = 'Connecting...';
      statusEl.className = 'terminal-status connecting';

      try {
        // Connect directly to WebSocket endpoint that proxies to sandbox PTY server
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        const wsUrl = protocol + '//' + window.location.host + '/api/sessions/${sessionId}/ws?cols=' + cols + '&rows=' + rows;
        console.log('Connecting to:', wsUrl);

        ws = new WebSocket(wsUrl);

        ws.onopen = () => {
          statusEl.textContent = 'Connected';
          statusEl.className = 'terminal-status connected';
        };

        ws.onmessage = (e) => {
          // Simple protocol: raw terminal output
          terminal?.write(e.data);
        };

        ws.onclose = () => {
          statusEl.textContent = 'Disconnected';
          statusEl.className = 'terminal-status disconnected';
          terminal?.write('\\r\\n\\x1b[33mDisconnected. Click Reconnect to try again.\\x1b[0m\\r\\n');
        };

        ws.onerror = (err) => {
          console.error('WebSocket error:', err);
          statusEl.textContent = 'Error';
          statusEl.className = 'terminal-status error';
        };
      } catch (error) {
        console.error('Failed to connect:', error);
        statusEl.textContent = 'Error';
        statusEl.className = 'terminal-status error';
        terminal?.write('\\r\\n\\x1b[31mFailed to connect: ' + error.message + '\\x1b[0m\\r\\n');
      }
    }

    window.reconnectTerminal = () => {
      ws?.close();
      connectWebSocket();
    };

    function setupDragAndDrop(container) {
      // Prevent default browser behavior of navigating to dropped files
      ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
        container.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
        // Also prevent on document to catch drops outside the container
        document.addEventListener(eventName, (e) => {
          e.preventDefault();
          e.stopPropagation();
        });
      });

      // Visual feedback
      ['dragenter', 'dragover'].forEach(eventName => {
        container.addEventListener(eventName, () => {
          container.classList.add('drag-over');
        });
      });

      ['dragleave', 'drop'].forEach(eventName => {
        container.addEventListener(eventName, () => {
          container.classList.remove('drag-over');
        });
      });

      // Handle dropped files
      container.addEventListener('drop', async (e) => {
        const files = e.dataTransfer?.files;
        if (!files?.length) return;

        for (const file of files) {
          if (file.type.startsWith('image/')) {
            // Convert image to base64 data URL
            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result;
              if (ws && ws.readyState === WebSocket.OPEN) {
                // Send as a special message - PTY server will save and insert filepath
                ws.send(JSON.stringify({ type: 'image', data: base64, name: file.name }));
              }
            };
            reader.readAsDataURL(file);
          } else {
            // For non-images, just insert the filename as text
            if (ws && ws.readyState === WebSocket.OPEN) {
              ws.send(file.name);
            }
          }
        }
      });

      // Also handle paste for images (Ctrl+V / Cmd+V)
      container.addEventListener('paste', async (e) => {
        const items = e.clipboardData?.items;
        if (!items) return;

        for (const item of items) {
          if (item.type.startsWith('image/')) {
            e.preventDefault();
            const file = item.getAsFile();
            if (!file) continue;

            const reader = new FileReader();
            reader.onload = () => {
              const base64 = reader.result;
              if (ws && ws.readyState === WebSocket.OPEN) {
                ws.send(JSON.stringify({ type: 'image', data: base64, name: 'pasted-image.png' }));
              }
            };
            reader.readAsDataURL(file);
          }
        }
      });
    }

    initTerminal();
  `;
}

const clientScript = `
// Quick create - no modal, just start
async function quickCreateSession() {
  const now = new Date();
  const name = 'Session ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });

  try {
    const res = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, status: 'running', startedAt: Date.now() }),
    });
    if (res.ok) {
      const { data: session } = await res.json();
      window.location.href = '/sessions/' + session.id;
    }
  } catch (e) {
    console.error(e);
  }
}

async function startSession(id) {
  await fetch('/api/sessions/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'running', startedAt: Date.now() }),
  });
  location.reload();
}

async function pauseSession(id) {
  await fetch('/api/sessions/' + id, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status: 'paused' }),
  });
  location.reload();
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === 'n') {
    e.preventDefault();
    quickCreateSession();
  }
});
`;
