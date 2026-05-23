# High Power Approval Protocol

## Mode

HIGH_POWER_CONTROLLED_READY prepares future local execution with stronger scope, confirmation and rollback rules. It does not enable real execution.

## Difference From DRY_RUN_ONLY

DRY_RUN_ONLY validates and simulates requests. HIGH_POWER_CONTROLLED_READY adds future rules for project reads, project writes, local reports, validation commands and local commit preparation.

## Difference From CONTROLLED_LOCAL_READY

CONTROLLED_LOCAL_READY would allow reviewed real execution. HIGH_POWER_CONTROLLED_READY is still preparation only and keeps `real_execution_enabled` false.

## Normal Confirmation

Use for future low-risk read-only or validation commands.

```text
CHIEF_APPROVES_COMMAND: <command>
```

## Double Confirmation

Required for sensitive commands, local commits, runtime policy edits, bulk edits or any mode change.

```text
CHIEF_DOUBLE_APPROVES_HIGH_RISK_COMMAND: <command>
Reason: <reason>
Rollback: <rollback_plan>
```

## Rejection Format

```text
CHIEF_REJECTS_COMMAND: <command>
Reason: <reason>
```

## Rollback Format

```text
Rollback:
- Files affected:
- Restore command or manual recovery:
- Validation after rollback:
```

## Log Format

```text
timestamp:
command:
approval:
risk:
status:
output_summary:
files_changed:
rollback:
```

## Absolute Stop Rules

- Stop if real execution is enabled without Chief approval.
- Stop if a command touches secrets.
- Stop if a command targets outside `/Users/macbook/ultron`.
- Stop if a command includes `sudo`, `rm -rf`, `chmod`, `chown`, `git push`, `curl`, `wget` or `npm install`.
- Stop if a command mutates runtime policy without double confirmation.
