# ULTRON Learning Intake v1

## Status

`ULTRON_LEARNING_INTAKE_V1_READY_FOR_REVIEW`

## Purpose

Learning Intake v1 creates the first controlled local test flow for ULTRON learning. It validates that simulated input can move through sensitivity classification, knowledge distillation, guardrail checks, local memory writing, and memory read-back verification.

## Runtime Entry Point

Run from the repo root:

```bash
node runtime/learning_intake_runner.cjs
```

The runner reads:

- `runtime/learning_intake_test_payload.json`
- `runtime/learning_config.json`

It imports the local Learning Layer modules from `app/src/lib/` using Node dynamic import. The writer remains outside browser/UI execution.

## Flow

1. Load simulated payload.
2. Confirm `contains_real_data` is false.
3. Scan for blocked patterns such as `.env`, API keys, credentials, private keys, bank data, and card-like numbers.
4. Classify sensitivity with `sensitivityClassifier.js`.
5. Check reuse policy from `runtime/learning_config.json`.
6. Require `approval_simulated = true` for sensitive categories.
7. Distill knowledge with `knowledgeDistiller.js`.
8. Write memory through `memoryWriter.js`.
9. Read back stored atoms through `memoryReader.js`.
10. Print a JSON summary.

## Written Memory Targets

- `memory/classified/`
- `memory/distilled_knowledge/`
- `memory/tasks/`
- `memory/learning_atoms.json`
- `memory/knowledge_index.json`

Raw input is only written when the classification and writer guardrails allow local raw retention.

## Test Payload Rules

The test payload must remain fictitious:

- `project`: `ULTRON_TEST`
- `source_type`: `simulated_note`
- `approval_simulated`: `true`
- `contains_real_data`: `false`

No real personal, client, credential, banking, or production data should be placed in this payload.

## Non-Goals

- No UI integration.
- No backend API required.
- No Claude, OpenAI, Gemini, or external API calls.
- No fine-tuning.
- No git commit or push.

## Review Notes

This runner is intentionally local and explicit. It is a proving path for controlled learning before any future operator UI, approval queue, RAG indexing, or backend endpoint is added.

