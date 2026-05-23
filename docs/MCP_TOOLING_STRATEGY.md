# MCP Tooling Strategy

## Role In ULTRON

MCP should become ULTRON's standard tool interface. It lets ULTRON connect to tools through declared servers instead of hard-coding every integration.

MCP is not active in ULTRON yet. This document defines safe adoption.

## Candidate Servers

| MCP Server | Candidate Use | Initial Permission |
|---|---|---|
| filesystem | Read project files and inspect directories | READ_ONLY first |
| git | git status, diff, log and branch inspection | READ_ONLY first |
| time | deterministic timestamps and timezone context | READ_ONLY |
| fetch | public documentation retrieval | APPROVAL_REQUIRED |
| sequentialthinking | structured reasoning support | SUGGEST_ONLY |
| memory | mock/local knowledge graph | BLOCKED until private memory policy |

## Approval Model

Every MCP server must be approved with:

- server name
- command/transport
- allowed roots or endpoints
- exposed tools
- risk class per tool
- project allowlist
- logging requirement
- disable/removal command

## Tool Risk Metadata

ULTRON should classify each MCP tool with:

- readOnly
- idempotent
- destructive
- networked
- credential_required
- writes_files
- executes_process
- touches_private_data

## Filesystem MCP Rules

- Start with explicit roots only.
- Use read tools first.
- Require dry run for edits.
- Block broad deletion and move operations.
- List allowed directories before use.

## Git MCP Rules

Safe first tools:

- git_status
- git_log
- git_diff_unstaged
- git_diff_staged
- git_show

Approval required:

- git_add
- git_commit
- git_create_branch
- git_checkout
- git_reset

Blocked by default:

- push
- destructive reset
- rewriting history

## Avoiding Silent Execution

ULTRON must never let MCP tools execute invisibly. Each call needs:

- visible tool name
- arguments summary
- permission level
- result summary
- error capture
- audit entry

## Project Isolation

Each project must have its own MCP profile:

- ultron_public_demo
- ultron_private_lab_future
- aethermind_future
- coco_venture_future
- aethercolony_future

No profile may share roots or credentials by default.

## Dangerous Tool Isolation

Network, browser, database, shell and write tools must live behind:

- explicit enable flag
- project-specific allowlist
- Chief approval for first use
- per-session revocation
- log retention

## First Implementation Target

Create a local MCP tool registry document or JSON later. Do not start MCP servers yet. The next safe step is policy and registry, not live integration.
