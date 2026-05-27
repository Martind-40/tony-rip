# ULTRON Learning Intake Negative Test v1

## Status

`ULTRON_LEARNING_INTAKE_NEGATIVE_TEST_V1_READY_FOR_REVIEW`

## Purpose

This test proves that ULTRON blocks local learning writes when simulated input contains sensitive markers, fake credential-like values, `.env` references, API key labels, or `CONFIDENTIAL` content without simulated human approval.

## Command

```bash
node runtime/learning_intake_runner.cjs --payload runtime/learning_intake_negative_payload.json
```

## Blocked Payload Signals

The negative payload is fully fictitious and includes:

- `.env`
- `ANTHROPIC_API_KEY=sk-ant-fake-test-key`
- `OPENAI_API_KEY=sk-fake-test-key`
- `CONFIDENTIAL`
- `approval_simulated: false`
- `contains_real_data: false`

The fake keys are intentionally nonfunctional examples.

## Expected Result

The runner should return a blocked result:

```json
{
  "write_result": "BLOCKED",
  "reason": "SENSITIVE_CONTENT_WITHOUT_APPROVAL",
  "files_updated": [],
  "final_status": "ULTRON_LEARNING_INTAKE_NEGATIVE_TEST_OK"
}
```

## Files That Must Not Change

On the negative path, the runner must not write or update:

- `memory/raw_input/`
- `memory/classified/`
- `memory/distilled_knowledge/`
- `memory/tasks/`
- `memory/learning_atoms.json`
- `memory/knowledge_index.json`

## Controls Verified

- Payload path is constrained to `/Users/macbook/ultron`.
- Real data is rejected unless `contains_real_data` is false.
- Credential-like patterns are scanned before memory writes.
- `.env` references are scanned before memory writes.
- Sensitive content without simulated approval is blocked.
- Memory snapshots verify that no watched memory files changed.

## Non-Goals

- No external APIs.
- No model calls.
- No UI connection.
- No fine-tuning.
- No commit or push.

