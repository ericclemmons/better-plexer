# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # Start local dev server (wrangler dev)
npm run typecheck  # TypeScript type checking
npm run deploy     # Deploy to Cloudflare Workers
```

## Architecture

Better Plexer is a cloud-native workspace manager for CLI-based AI coding tools (Claude Code, OpenCode, Codex), deployed on Cloudflare's edge infrastructure.

**Core Stack:** Cloudflare Workers + Hono.js + Durable Objects + KV + R2 + Sandboxes

### Key Components

- **`src/index.ts`** - Main Worker entry point with Hono REST API and WebSocket terminal proxy
- **`src/durable-objects/session-coordinator.ts`** - SessionCoordinator DO for real-time WebSocket coordination
- **`src/ui/templates.ts`** - Server-side rendered HTML/JS (dashboard, terminal with ghostty-web)
- **`src/types.ts`** - TypeScript types (Session, SessionStatus, SandboxInstance, etc.)
- **`pty-server.mjs`** - Node.js PTY server that runs inside Cloudflare Sandboxes
- **`Dockerfile`** - Sandbox container image (based on cloudflare/sandbox, includes OpenCode CLI)

### Data Flow

1. Browser connects to Worker → serves SSR HTML from `templates.ts`
2. Terminal connects via WebSocket to `/api/sessions/:id/ws`
3. Worker proxies WebSocket to PTY server running in Sandbox (port 7681)
4. PTY server spawns shell, relays I/O bidirectionally

### Session States

`idle` → `starting` → `running` → `waiting` → `validating` → `completed` | `failed` | `paused`

## API Routes

| Method | Route | Purpose |
|--------|-------|---------|
| GET/POST | `/api/sessions` | List/create sessions |
| GET/PATCH/DELETE | `/api/sessions/:id` | Session CRUD |
| POST | `/api/sessions/:id/exec` | Execute command in sandbox |
| GET | `/api/sessions/:id/ws` | WebSocket for terminal |

## Wrangler Bindings

- `SESSIONS` - KV namespace for session state
- `STORAGE` - R2 bucket for persistent storage
- `SESSION_COORDINATOR` - Durable Object
- `Sandbox` - Cloudflare Sandbox DO (container: standard-1 instance)
