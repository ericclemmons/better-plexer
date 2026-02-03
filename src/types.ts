/**
 * Core types for Better Plexer
 */

// Session status
export type SessionStatus =
  | 'idle'           // Created but not started
  | 'starting'       // Sandbox is spinning up
  | 'running'        // Agent is actively working
  | 'waiting'        // Waiting for user input or external resource
  | 'validating'     // Running tests/CI in validation sandbox
  | 'completed'      // Task finished successfully
  | 'failed'         // Task failed
  | 'paused';        // User paused the session

// Repository relationship for a session
export interface RepoRelation {
  id: string;
  repoUrl: string;           // e.g., github.com/org/repo
  branch: string;            // The working branch
  baseBranch: string;        // The branch to PR against (main, develop, etc.)
  status: 'pending' | 'cloned' | 'modified' | 'pushed' | 'pr-created';
  lastCommit?: string;
  prUrl?: string;
}

// A sandbox instance (execution environment)
export interface SandboxInstance {
  id: string;
  sessionId: string;
  type: 'primary' | 'validation';
  status: 'creating' | 'ready' | 'running' | 'stopped' | 'error';
  repoRelationId?: string;   // If this sandbox is for a specific repo
  createdAt: number;
  lastActiveAt: number;
}

// A chat/coding session
export interface Session {
  id: string;
  name: string;
  description?: string;
  status: SessionStatus;
  agent: 'claude-code' | 'opencode' | 'codex' | 'custom';

  // Task tracking
  taskId?: string;           // External ID like JIRA-123
  taskSource?: string;       // jira, linear, github, etc.

  // Repository relationships (0 to N)
  repos: RepoRelation[];

  // Sandbox info
  primarySandboxId?: string;
  validationSandboxes: string[];  // IDs of validation sandboxes

  // Timestamps
  createdAt: number;
  updatedAt: number;
  startedAt?: number;
  completedAt?: number;

  // Metrics
  totalTokens?: number;
  totalCost?: number;
}

// Workspace configuration
export interface Workspace {
  id: string;
  name: string;
  owner: string;

  // Default settings
  defaultAgent: Session['agent'];
  defaultBaseBranch: string;

  // Shared resources
  sharedConfigBucket: string;  // R2 bucket for shared ~/.config

  // Access
  allowedUsers: string[];      // Cloudflare Access emails

  createdAt: number;
}

// API response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

// Event types for real-time updates
export type SessionEvent =
  | { type: 'status_changed'; sessionId: string; status: SessionStatus }
  | { type: 'repo_updated'; sessionId: string; repo: RepoRelation }
  | { type: 'sandbox_status'; sessionId: string; sandboxId: string; status: SandboxInstance['status'] }
  | { type: 'output'; sessionId: string; data: string }
  | { type: 'error'; sessionId: string; message: string };

import type { Sandbox } from '@cloudflare/sandbox';

// Cloudflare bindings
export interface Env {
  SESSIONS: KVNamespace;
  STORAGE: R2Bucket;
  SESSION_COORDINATOR: DurableObjectNamespace;
  Sandbox: DurableObjectNamespace<Sandbox>;  // Cloudflare Sandbox
  ENVIRONMENT: string;
}
