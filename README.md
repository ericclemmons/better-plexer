# Better Plexer

A cloud-native chat multiplexer for AI coding sessions. Think of it as a workspace manager for CLI-based AI tools like Claude Code, OpenCode, or Codex — deployed on Cloudflare's edge infrastructure.

## Key Features

- **Multi-repo Sessions**: A single chat session can coordinate changes across multiple repositories and branches
- **Cloud-native**: Accessible from anywhere, deployed on Cloudflare Workers
- **Thin-client Design**: No GUI for chats — delegates to CLI tools. The UI is purely for workspace visibility
- **Sandbox Execution**: Uses Cloudflare Sandboxes for isolated execution and CI-like validation
- **Real-time Updates**: WebSocket-based terminal streaming and status updates

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    Cloudflare Access (Auth)                      │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                     Cloudflare Worker                            │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │
│  │   Hono API  │  │  Static UI  │  │  Session Coordinator DO │  │
│  └─────────────┘  └─────────────┘  └─────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
          │                                    │
          ▼                                    ▼
┌─────────────────┐              ┌─────────────────────────────────┐
│   KV (Sessions) │              │        Cloudflare Sandboxes     │
└─────────────────┘              │  ┌─────────┐    ┌─────────────┐ │
          │                      │  │ Primary │    │ Validation  │ │
          │                      │  │ Sandbox │    │ Sandboxes   │ │
          ▼                      │  └─────────┘    └─────────────┘ │
┌─────────────────┐              └─────────────────────────────────┘
│  R2 (Storage)   │                             │
│  - Repos        │                             │
│  - Shared cfg   │◄────────────────────────────┘
└─────────────────┘
```

## Workflow

1. **Create Session**: Name it, optionally link to a task (JIRA-123), pick your AI agent
2. **Add Repositories**: Mount 0-N repos with branch information
3. **Start Session**: Primary sandbox spins up with your chosen AI agent
4. **Work**: Agent makes changes across repos, creating branches as needed
5. **Validate**: Spawn validation sandboxes to run tests (like CI)
6. **Complete**: Push branches, create PRs

## Development

```bash
# Install dependencies
npm install

# Start dev server
npm run dev

# Type check
npm run typecheck

# Deploy to Cloudflare
npm run deploy
```

## Project Structure

```
├── src/
│   ├── index.ts              # Main worker entry point
│   ├── types.ts              # TypeScript types
│   ├── ui/
│   │   └── templates.ts      # HTML templates for UI
│   └── durable-objects/
│       └── session-coordinator.ts  # Real-time coordination
├── public/
│   └── styles.css            # UI styles
├── wrangler.toml             # Cloudflare configuration
└── package.json
```

## Configuration

Before deploying, you'll need to:

1. Create a KV namespace: `wrangler kv:namespace create SESSIONS`
2. Create an R2 bucket: `wrangler r2 bucket create plexer-storage`
3. Update `wrangler.toml` with the actual IDs
4. Set up Cloudflare Access for your domain

## Status

🚧 **Work in Progress**

- [x] Core data models
- [x] API routes for session CRUD
- [x] Gorgeous dark UI
- [x] Durable Object for coordination
- [ ] Cloudflare Sandbox integration
- [ ] Terminal component (xterm.js/ghostty-web)
- [ ] SKILLS.md for agent instructions
- [ ] R2 bucket mounting
- [ ] Multi-repo coordination logic
