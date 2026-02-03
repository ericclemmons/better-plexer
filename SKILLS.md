# Better Plexer Agent Skills

This document instructs AI agents (Claude Code, OpenCode, Codex) on how to operate within the Better Plexer environment.

## Environment Overview

You are running inside a Cloudflare Sandbox. Your workspace has:
- **Persistent Storage**: R2 buckets mounted at specific paths
- **Session State**: Your work persists across restarts
- **Shared Config**: Access to shared authentication and credentials at `~/.config/plexer/`
- **Validation Sandboxes**: Ability to spawn isolated environments for testing

## Repository Management

### Cloning a Repository

To work with a repository, first clone it using the mounted R2 storage:

```bash
# Create workspace directory
mkdir -p /workspace/repos

# Clone via git (credentials from shared config)
cd /workspace/repos
git clone https://github.com/org/repo-name.git
cd repo-name

# Create a feature branch
git checkout -b feature/your-feature-name
```

### Working with Multiple Repos

When your task spans multiple repositories:

1. Clone each repo into `/workspace/repos/`
2. Track which repos you're modifying
3. Coordinate changes to ensure compatibility
4. Validate changes together before pushing

```bash
# Example: Working on frontend + backend
/workspace/repos/
├── frontend/   # React app
└── backend/    # API server
```

### Pushing Changes

After completing work on a branch:

```bash
cd /workspace/repos/repo-name

# Stage and commit
git add .
git commit -m "feat: description of changes"

# Push the branch
git push -u origin feature/your-feature-name
```

## Validation

### Running Tests Locally

Run tests in your current sandbox:

```bash
cd /workspace/repos/repo-name
npm test
# or
npm run test:ci
```

### Spawning a Validation Sandbox

For isolated CI-like validation, request a validation sandbox:

```bash
# Signal to Better Plexer to spawn a validation sandbox
plexer sandbox create --type validation --repo /workspace/repos/repo-name

# The validation sandbox will:
# 1. Clone a fresh copy of the repo
# 2. Checkout your branch
# 3. Install dependencies
# 4. Run the test suite
# 5. Report results back
```

## Shared Configuration

### Available Credentials

The shared config directory contains:

```
~/.config/plexer/
├── github/          # GitHub authentication
│   └── credentials
├── npm/             # NPM registry tokens
│   └── .npmrc
└── cloud/           # Cloud provider credentials
    ├── aws/
    ├── gcp/
    └── cloudflare/
```

### Using GitHub CLI

```bash
# Already authenticated via shared config
gh pr create --title "Your PR title" --body "Description"
gh pr list
gh issue view 123
```

## Session Coordination

### Reporting Status

Keep Better Plexer informed of your progress:

```bash
# Update session status
plexer status --message "Working on authentication module"

# Report completion of a sub-task
plexer task complete --id "subtask-1"

# Report errors
plexer error --message "Build failed: missing dependency"
```

### Working with Sub-agents

If you need to coordinate with other agents:

```bash
# Request a sub-agent for a specific task
plexer agent spawn --task "Review and fix TypeScript errors in frontend"

# Wait for sub-agent completion
plexer agent wait --id "agent-xyz"
```

## Best Practices

### 1. Atomic Commits
Make small, focused commits that can be easily reviewed and reverted.

### 2. Branch Naming
Use descriptive branch names:
- `feature/add-user-auth`
- `fix/login-validation`
- `refactor/api-endpoints`

### 3. Testing Before Push
Always run tests before pushing:
```bash
npm test && git push
```

### 4. Cross-repo Changes
When changes span repos, ensure:
- API contracts are compatible
- Version dependencies are updated
- Integration tests pass

### 5. Documentation
Update relevant documentation when making changes:
- API docs for backend changes
- Component docs for frontend changes
- README for setup changes

## Troubleshooting

### Sandbox Connectivity
If you can't reach external services:
```bash
# Check network status
plexer network status

# Request network access
plexer network allow --host api.example.com
```

### Storage Issues
If storage is full or unavailable:
```bash
# Check storage status
plexer storage status

# Clean up temporary files
plexer storage cleanup
```

### Authentication Failures
If credentials aren't working:
```bash
# Refresh credentials from shared config
plexer auth refresh

# Check credential status
plexer auth status
```

## Available Commands

| Command | Description |
|---------|-------------|
| `plexer status` | Report current status |
| `plexer sandbox create` | Spawn a new sandbox |
| `plexer sandbox list` | List active sandboxes |
| `plexer agent spawn` | Request a sub-agent |
| `plexer storage status` | Check storage usage |
| `plexer network status` | Check network connectivity |
| `plexer auth status` | Check authentication status |

## Example Workflow

Here's a complete example of working on a feature:

```bash
# 1. Set up workspace
mkdir -p /workspace/repos
cd /workspace/repos

# 2. Clone the repo
git clone https://github.com/org/my-app.git
cd my-app

# 3. Create feature branch
git checkout -b feature/add-dark-mode

# 4. Update status
plexer status --message "Starting dark mode implementation"

# 5. Make changes
# ... edit files ...

# 6. Test locally
npm test

# 7. Request validation sandbox for full CI
plexer sandbox create --type validation --repo .

# 8. If validation passes, commit and push
git add .
git commit -m "feat: add dark mode toggle"
git push -u origin feature/add-dark-mode

# 9. Create PR
gh pr create --title "Add dark mode toggle" --body "Implements dark mode..."

# 10. Report completion
plexer status --message "PR created, ready for review"
```
