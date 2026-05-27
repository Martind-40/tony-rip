# ULTRON Learning Intake Audit v1

## Status

`ULTRON_LEARNING_INTAKE_AUDIT_V1_READY_FOR_REVIEW`

## Purpose

This audit runs the positive and negative learning intake checks from one local command while avoiding memory pollution. The positive path runs in dry-run mode, and the negative path verifies that blocked sensitive content does not modify memory.

## Command

```bash
node runtime/learning_intake_audit.cjs
```

## What It Verifies

Positive dry-run:

- Sensitivity classification exists.
- At least one knowledge atom is generated.
- `write_result` is `PASS_SIMULATED`.
- Final status is `ULTRON_LEARNING_INTAKE_V1_OK`.
- No memory files are modified.

Negative blocked test:

- `write_result` is `BLOCKED`.
- `reason` contains `SENSITIVE_CONTENT_WITHOUT_APPROVAL`.
- `files_updated` is empty.
- No watched memory path is modified.

## Watched Memory Paths

- `memory/raw_input/`
- `memory/classified/`
- `memory/distilled_knowledge/`
- `memory/tasks/`
- `memory/learning_atoms.json`
- `memory/knowledge_index.json`

## Expected Summary

```json
{
  "positive_test": "PASS",
  "negative_test": "PASS",
  "memory_pollution": "NO",
  "build_required": true,
  "final_status": "ULTRON_LEARNING_INTAKE_AUDIT_V1_PASS"
}
```

## Non-Goals

- No external APIs.
- No real data.
- No `.env` access.
- No UI connection.
- No commit or push.

