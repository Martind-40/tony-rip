# ULTRON Runtime Safety

## Status

DRY_RUN_READY

## What This Layer Does

- Loads the Local Command Bridge policy.
- Loads the safe command allowlist.
- Validates command IDs before any future execution.
- Checks protected paths, blocked keywords, secret access, external network use and permission level.
- Creates simulated runtime results and log entries.

## What It Does Not Do

- It does not execute terminal commands.
- It does not use `child_process`, `exec` or `spawn`.
- It does not connect to APIs, MCP servers, paid providers or external networks.
- It does not read secrets.
- It does not write outside `/Users/macbook/ultron`.
- It does not enable autonomous agents.

## Chief Gates Required Before Real Execution

- Private Mode approval.
- Explicit Chief approval.
- Reviewed command allowlist.
- Reviewed protected path policy.
- Action logging enabled.
- Rollback plan for any future write action.
- Manual approval before publishing, deleting or mutating files.

## Commands That Remain Blocked

- `rm`
- `sudo`
- `chmod`
- `chown`
- `git reset --hard`
- `git push`
- `curl`
- `wget`
- `npm install`
- secret access
- writes outside the ULTRON project

## Private Mode Requirement

Private Mode must remain `NOT_READY` until a separate execution gate is approved. This runtime is ready for review, not real execution.
