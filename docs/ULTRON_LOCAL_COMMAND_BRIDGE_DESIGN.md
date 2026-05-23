# ULTRON Local Command Bridge Design

## Status

DESIGN_READY_NOT_EXECUTING

## What Was Created

- `core/local_command_bridge.policy.json`
- `core/safe_commands.allowlist.json`
- `memory/operator_command_log_TEMPLATE.md`
- Visible Local Command Bridge panel in the UI.

## What Is Prepared

- Strict allowlist for future safe commands.
- Explicit blocked command list.
- Policy requirements for approval, logging and path isolation.
- Command log template for future execution records.
- UI simulation that writes bridge requests to the existing Action Log.

## What It Does Not Execute Yet

- No terminal commands.
- No git commands.
- No build runner.
- No filesystem writes.
- No network calls.
- No MCP tools.
- No autonomous loops.

## Why It Is Safe

- Execution mode is disabled by default.
- Private Mode is required before any real execution.
- Chief approval is required.
- Destructive commands are blocked.
- Protected paths are listed.
- No credentials or secrets are accessed.

## Required Before Real Execution

- Reviewed local command bridge implementation.
- Hardcoded allowlist enforcement.
- Runtime timeout.
- Captured stdout/stderr/exit code.
- Write-safe rollback policy.
- Human approval UI for non-read-only actions.

## Risks Blocked

- `rm`, `sudo`, `chmod`, `chown`.
- `git push`.
- `git reset --hard`.
- External `curl`.
- `npm install`.
- Writes outside `/Users/macbook/ultron`.

## Build Result

PASS from `/Users/macbook/ultron/app` with `npm run build`.

## Git State

Pending local changes. No commit or push performed in this block.
