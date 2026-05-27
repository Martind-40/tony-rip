# ULTRON Memory Policy v1

## Status

`ULTRON_MEMORY_POLICY_V1_ACTIVE`

## Central Principle

ULTRON does not learn by saving everything. ULTRON learns by classifying input, distilling it, and storing clean, traceable, reusable knowledge.

## Memory Types

- `raw_input`: original local input. This is high-risk and must not be versioned when it contains real data.
- `classified`: sensitivity classification records and redacted previews.
- `distilled_knowledge`: cleaned knowledge extracted from source material.
- `tasks`: tasks extracted from approved or simulated learning intake.
- `learning_atoms`: reusable knowledge atoms in `memory/learning_atoms.json`.
- `knowledge_index`: searchable local index in `memory/knowledge_index.json`.

## What Can Be Versioned

- Base memory structure.
- `.gitkeep` files.
- Runtime learning configuration.
- Runtime learning runners and audit scripts.
- Documentation.
- Safe simulated payloads.
- Clean seeds for `learning_atoms.json` and `knowledge_index.json`.

## What Must Not Be Versioned

- Real audio.
- Real transcripts.
- Raw workplace data.
- Credentials.
- `.env` files.
- API keys.
- Personal data.
- Local SQLite databases.
- Timestamp test outputs.
- Runtime session files.
- Real `raw_input` files.
- Generated test artifacts outside approved seed files.

## Sensitivity Policy

ULTRON recognizes these learning categories:

- `PUBLIC`: public or intentionally shareable content.
- `INTERNAL`: local project or operator context.
- `SENSITIVE`: material that could create exposure if stored or reused.
- `CONFIDENTIAL`: restricted material, secrets, or explicitly confidential content.
- `PERSONAL`: personal identifiers or private human data.
- `REUSABLE_KNOWLEDGE`: cleaned knowledge safe to reuse after classification and redaction.

## Human Approval Policy

All `SENSITIVE`, `CONFIDENTIAL`, or `PERSONAL` content requires explicit human approval before write. Approval must happen before local memory persistence, reuse, export, or inclusion in any future RAG process.

## Git Policy

Do not use `git add .` for ULTRON memory work. Every commit must be selective and scoped. Memory-related commits must explicitly exclude local runtime artifacts, raw generated inputs, timestamp outputs, databases, sessions, and unreviewed sensitive material.

## Memory Versioning Policy

`memory/learning_atoms.json` and `memory/knowledge_index.json` may be versioned only as clean seeds or as explicitly approved memory. Timestamp outputs under `memory/raw_input/`, `memory/classified/`, `memory/distilled_knowledge/`, and `memory/tasks/` are not versioned.

## Cleanup Policy

Use `runtime/memory_cleanup_guard.cjs` to inspect non-versionable memory and runtime artifacts. The default mode only reports. The `--apply` mode may delete only safe `ULTRON_TEST` outputs and must not delete seeds, `.gitkeep`, docs, runtime learning scripts, source code, or server files.

