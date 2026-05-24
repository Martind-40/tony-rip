# ULTRON v1.1 Real Operator Testing Protocol

## Block

ULTRON v1.1 — Real Operator Testing

## Date

2026-05-24

## Initial Status

- MVP v1 is closed operational.
- Public Demo is ready.
- Controlled Local Execution is verified.
- Runner: `runtime/controlled_local_executor.cjs`.
- Private memory directory is Git-ignored.
- Build baseline: PASS.

## Objective

Test ULTRON in longer controlled real operations without adding features, opening network access, reading secrets or enabling autonomous execution.

## Security Rules

- Use only `/Users/macbook/ultron`.
- Require human/Chief review before execution.
- Keep browser execution disabled.
- Keep external network blocked.
- Keep secrets blocked.
- Keep git push blocked.
- Keep autonomous agents blocked.
- Keep destructive commands blocked.

## Currently Allowed Commands

- `project_path_check`
- `repo_file_scan_limited`
- `git_status_review`
- `git_log_review`
- `git_diff_stat_review`
- `app_build_check`

## Prohibited Commands

- `git push`
- `sudo`
- `rm -rf`
- `chmod`
- `chown`
- `curl`
- `wget`
- `npm install`
- `.env` or `.ssh` access
- any path outside `/Users/macbook/ultron`

## Approval Criteria For A Real Operation

- Command is allowlisted.
- Working directory stays inside ULTRON.
- Reason is explicit.
- Rollback note is present.
- Output can be summarized without sensitive data.
- Build or status validation is available after the operation.

## Blocking Criteria

- Command is not allowlisted.
- Command touches secrets.
- Command uses network.
- Command mutates protected paths.
- Command affects external projects.
- Rollback cannot be described.

## Before Execution Review

1. Check repo status.
2. Confirm command ID is allowlisted.
3. Confirm no secrets or external paths.
4. Confirm rollback plan.
5. Confirm expected output.

## After Execution Review

1. Review command log.
2. Review diff.
3. Validate build if files changed.
4. Confirm no unexpected files.
5. Record final decision.

## Rollback Protocol

- Revert only the scoped file or operation.
- Re-run diff for the affected path.
- Reapply only if evidence is needed.
- Log rollback result.

## Current Limits

- No free-form shell.
- No network.
- No secrets.
- No automatic commit/push from runner.
- No real autonomous agents.

## Open Risks

- Write operations still require manual rollback discipline.
- Longer operator tasks may need output truncation review.
- Future private workflows need deletion/retention controls.

## Expected Decision

ULTRON v1.1 READY FOR CONTROLLED DAILY USE.

## Final Validation Addendum

- Longer repo file scan executed.
- Private memory path exclusion verified after tightening the scan filter.
- Diff stat review executed.
- Build check executed through the controlled runner.
- Final build passed.
