# ULTRON Controlled Local Execution MVP

## Status

CONTROLLED_LOCAL_EXECUTION_MVP_READY

## What Is Active

- Local CLI execution for allowlisted commands only.
- Scope locked to `/Users/macbook/ultron`.
- Chief approval flag required for every command.
- Command log writes to `runtime/operator_command_log.md`.
- Shell execution disabled.
- Timeout and output truncation enabled.

## Allowed MVP Commands

- `project_path_check`
- `repo_file_scan_limited`
- `git_status_review`
- `git_log_review`
- `git_diff_stat_review`
- `app_build_check`

## Blocked

- Browser/UI command execution.
- External network.
- Secrets and credentials.
- `.env`, `.ssh`, private keys and tokens.
- `sudo`, `rm`, `rm -rf`, `chmod`, `chown`.
- `git reset --hard`, `git push`.
- `curl`, `wget`, `npm install`.
- Any path outside `/Users/macbook/ultron`.
- AetherMind, Coco Venture and AetherColony.

## Usage

```bash
node runtime/controlled_local_executor.cjs git_status_review \
  --chief-approve \
  --reason "Chief approved controlled local status check" \
  --rollback "Read-only command; no rollback needed"
```

## Rollback

Read-only commands require no rollback. Build checks may regenerate ignored `dist/` output. Log entries can be reverted manually if the Chief requests a clean log state.

## Final Decision

Controlled local execution is active only through the local CLI allowlist. Public demo UI remains non-executing.
