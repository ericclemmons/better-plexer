import type { Session, SessionStatus } from '../types';

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
  clock: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="10"/>
    <polyline points="12 6 12 12 16 14"/>
  </svg>`,
  code: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <polyline points="16 18 22 12 16 6"/>
    <polyline points="8 6 2 12 8 18"/>
  </svg>`,
  bot: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <rect x="3" y="11" width="18" height="10" rx="2"/>
    <circle cx="12" cy="5" r="2"/>
    <path d="M12 7v4"/>
    <line x1="8" y1="16" x2="8" y2="16"/>
    <line x1="16" y1="16" x2="16" y2="16"/>
  </svg>`,
  x: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/>
    <line x1="6" y1="6" x2="18" y2="18"/>
  </svg>`,
  settings: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <circle cx="12" cy="12" r="3"/>
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/>
  </svg>`,
  folder: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
    <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/>
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
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function getAgentIcon(agent: Session['agent']): string {
  switch (agent) {
    case 'claude-code':
      return '🤖';
    case 'opencode':
      return '⚡';
    case 'codex':
      return '🧠';
    default:
      return '🔧';
  }
}

function baseLayout(title: string, content: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | Better Plexer</title>
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="/styles.css">
</head>
<body>
  <div class="app">
    <header class="header">
      <div class="header-inner">
        <a href="/" class="logo">
          <div class="logo-icon">${icons.logo}</div>
          <span>Better Plexer</span>
        </a>
        <div class="header-actions">
          <button class="btn btn-ghost btn-icon" title="Settings">
            ${icons.settings}
          </button>
        </div>
      </div>
    </header>
    <main class="main">
      ${content}
    </main>
  </div>
  <script>
    ${clientScript}
  </script>
</body>
</html>`;
}

function renderStats(sessions: Session[]): string {
  const running = sessions.filter(s => s.status === 'running').length;
  const completed = sessions.filter(s => s.status === 'completed').length;
  const totalRepos = sessions.reduce((acc, s) => acc + s.repos.length, 0);

  return `
    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-value accent">${sessions.length}</div>
        <div class="stat-label">Total Sessions</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-running)">${running}</div>
        <div class="stat-label">Running</div>
      </div>
      <div class="stat-card">
        <div class="stat-value" style="color: var(--status-completed)">${completed}</div>
        <div class="stat-label">Completed</div>
      </div>
      <div class="stat-card">
        <div class="stat-value">${totalRepos}</div>
        <div class="stat-label">Repo Branches</div>
      </div>
    </div>
  `;
}

function renderSessionCard(session: Session): string {
  const repoTags = session.repos.map(repo => `
    <span class="repo-tag">
      ${icons.git}
      <span>${repo.repoUrl.split('/').pop()}</span>
      <span class="branch">${repo.branch}</span>
    </span>
  `).join('');

  return `
    <div class="session-card" data-session-id="${session.id}" onclick="openSession('${session.id}')">
      <div class="session-card-header">
        <div class="session-icon">${icons.terminal}</div>
        <div class="session-info">
          <div class="session-name">
            ${session.name}
            ${session.taskId ? `<span class="session-task">${session.taskId}</span>` : ''}
          </div>
          <div class="session-description">${session.description || 'No description'}</div>
        </div>
        <span class="status-badge ${session.status}">${session.status}</span>
      </div>
      ${session.repos.length > 0 ? `<div class="session-repos">${repoTags}</div>` : ''}
      <div class="session-card-footer">
        <div class="session-agent">
          <span class="session-agent-icon">${getAgentIcon(session.agent)}</span>
          <span>${session.agent}</span>
        </div>
        <div class="session-time">${formatTimeAgo(session.updatedAt)}</div>
      </div>
    </div>
  `;
}

function renderEmptyState(): string {
  return `
    <div class="empty-state">
      <div class="empty-icon">${icons.folder}</div>
      <h3 class="empty-title">No sessions yet</h3>
      <p class="empty-description">
        Create your first coding session to start working with AI agents across your repositories.
      </p>
      <button class="btn btn-primary" onclick="openNewSessionModal()">
        ${icons.plus}
        New Session
      </button>
    </div>
  `;
}

function renderNewSessionModal(): string {
  return `
    <div class="modal-overlay" id="newSessionModal">
      <div class="modal">
        <div class="modal-header">
          <h2 class="modal-title">Create New Session</h2>
          <button class="btn btn-ghost btn-icon" onclick="closeNewSessionModal()">
            ${icons.x}
          </button>
        </div>
        <form id="newSessionForm" onsubmit="createSession(event)">
          <div class="modal-body">
            <div class="form-group">
              <label class="form-label" for="sessionName">Session Name</label>
              <input type="text" class="form-input" id="sessionName" name="name" placeholder="e.g., Feature: User Authentication" required>
            </div>
            <div class="form-group">
              <label class="form-label" for="sessionDescription">Description</label>
              <textarea class="form-input form-textarea" id="sessionDescription" name="description" placeholder="What are you working on?"></textarea>
            </div>
            <div class="form-group">
              <label class="form-label" for="taskId">Task ID (optional)</label>
              <input type="text" class="form-input" id="taskId" name="taskId" placeholder="e.g., JIRA-123, #456">
            </div>
            <div class="form-group">
              <label class="form-label" for="agent">AI Agent</label>
              <select class="form-input form-select" id="agent" name="agent">
                <option value="claude-code">Claude Code</option>
                <option value="opencode">OpenCode</option>
                <option value="codex">Codex</option>
                <option value="custom">Custom</option>
              </select>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" onclick="closeNewSessionModal()">Cancel</button>
            <button type="submit" class="btn btn-primary">Create Session</button>
          </div>
        </form>
      </div>
    </div>
  `;
}

export function renderDashboard(sessions: Session[]): string {
  const content = `
    <div class="page-header">
      <h1 class="page-title">Workspace</h1>
      <p class="page-subtitle">Manage your AI coding sessions across repositories</p>
    </div>

    ${renderStats(sessions)}

    <div class="sessions-header">
      <h2 class="sessions-title">Sessions</h2>
      <button class="btn btn-primary" onclick="openNewSessionModal()">
        ${icons.plus}
        New Session
      </button>
    </div>

    ${sessions.length > 0
      ? `<div class="sessions-grid">${sessions.map(renderSessionCard).join('')}</div>`
      : renderEmptyState()
    }

    ${renderNewSessionModal()}
  `;

  return baseLayout('Workspace', content);
}

export function renderSessionDetail(session: Session): string {
  const repoCards = session.repos.map(repo => `
    <div class="stat-card">
      <div class="flex items-center gap-sm mb-md">
        ${icons.git}
        <span class="text-sm">${repo.repoUrl}</span>
      </div>
      <div class="flex items-center justify-between">
        <span class="repo-tag">
          <span class="branch">${repo.branch}</span>
        </span>
        <span class="status-badge ${repo.status === 'pushed' ? 'completed' : repo.status === 'modified' ? 'running' : 'idle'}">${repo.status}</span>
      </div>
    </div>
  `).join('');

  const content = `
    <div class="page-header flex items-center justify-between">
      <div>
        <div class="flex items-center gap-md">
          <a href="/" class="btn btn-ghost">← Back</a>
          <h1 class="page-title">${session.name}</h1>
          ${session.taskId ? `<span class="session-task">${session.taskId}</span>` : ''}
        </div>
        <p class="page-subtitle">${session.description || 'No description'}</p>
      </div>
      <div class="flex gap-sm">
        ${session.status === 'running'
          ? `<button class="btn btn-secondary" onclick="pauseSession('${session.id}')">${icons.pause} Pause</button>`
          : `<button class="btn btn-primary" onclick="startSession('${session.id}')">${icons.play} Start</button>`
        }
        <button class="btn btn-secondary" onclick="stopSession('${session.id}')">${icons.stop} Stop</button>
      </div>
    </div>

    <div class="stats-bar">
      <div class="stat-card">
        <div class="stat-label">Status</div>
        <div class="mt-sm"><span class="status-badge ${session.status}">${session.status}</span></div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Agent</div>
        <div class="mt-sm flex items-center gap-sm">
          <span>${getAgentIcon(session.agent)}</span>
          <span>${session.agent}</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Repositories</div>
        <div class="stat-value mt-sm">${session.repos.length}</div>
      </div>
      <div class="stat-card">
        <div class="stat-label">Started</div>
        <div class="mt-sm text-sm">${session.startedAt ? formatTimeAgo(session.startedAt) : 'Not started'}</div>
      </div>
    </div>

    ${session.repos.length > 0 ? `
      <div class="sessions-header">
        <h2 class="sessions-title">Repositories</h2>
        <button class="btn btn-secondary">
          ${icons.plus}
          Add Repository
        </button>
      </div>
      <div class="sessions-grid" style="grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));">
        ${repoCards}
      </div>
    ` : ''}

    <div class="sessions-header mt-md">
      <h2 class="sessions-title">Terminal</h2>
      <button class="btn btn-secondary btn-icon" title="Refresh">
        ${icons.refresh}
      </button>
    </div>
    <div class="terminal-container">
      <span>Terminal connection will appear here when session is running</span>
    </div>
  `;

  return baseLayout(session.name, content);
}

// Client-side JavaScript
const clientScript = `
function openNewSessionModal() {
  document.getElementById('newSessionModal').classList.add('active');
}

function closeNewSessionModal() {
  document.getElementById('newSessionModal').classList.remove('active');
}

function openSession(id) {
  window.location.href = '/sessions/' + id;
}

async function createSession(event) {
  event.preventDefault();
  const form = event.target;
  const formData = new FormData(form);
  const data = Object.fromEntries(formData.entries());

  try {
    const response = await fetch('/api/sessions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      const result = await response.json();
      window.location.href = '/sessions/' + result.data.id;
    } else {
      alert('Failed to create session');
    }
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to create session');
  }
}

async function startSession(id) {
  await updateSessionStatus(id, 'running');
}

async function pauseSession(id) {
  await updateSessionStatus(id, 'paused');
}

async function stopSession(id) {
  await updateSessionStatus(id, 'idle');
}

async function updateSessionStatus(id, status) {
  try {
    const response = await fetch('/api/sessions/' + id, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });

    if (response.ok) {
      window.location.reload();
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

// Close modal on escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    closeNewSessionModal();
  }
});

// Close modal on overlay click
document.getElementById('newSessionModal')?.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal-overlay')) {
    closeNewSessionModal();
  }
});
`;
