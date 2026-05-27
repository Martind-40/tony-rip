# ULTRON Learning Layer v1

## Status

`ULTRON_LEARNING_LAYER_V1_READY_FOR_REVIEW`

## Purpose

Learning Layer v1 gives ULTRON a local-only learning path without machine learning, fine-tuning, external APIs, or cloud sync. ULTRON learns by turning input into classified, redacted, traceable, reusable knowledge atoms.

## Scope

This layer adds:

- Controlled memory paths under `memory/`.
- Local learning policy in `runtime/learning_config.json`.
- Sensitivity classification in `app/src/lib/sensitivityClassifier.js`.
- Knowledge distillation in `app/src/lib/knowledgeDistiller.js`.
- Memory persistence in `app/src/lib/memoryWriter.js`.
- Memory lookup and RAG preparation helpers in `app/src/lib/memoryReader.js`.

## Memory Layout

- `memory/raw_input/`: local raw input only when classification allows it.
- `memory/classified/`: classification records and redacted previews.
- `memory/distilled_knowledge/`: distilled learning payloads.
- `memory/tasks/`: extracted task records.
- `memory/learning_atoms.json`: reusable knowledge atoms.
- `memory/knowledge_index.json`: project, category, topic, and atom indexes.

## Sensitivity Model

The classifier returns:

- `category`: `PUBLIC`, `INTERNAL`, `SENSITIVE`, `CONFIDENTIAL`, `PERSONAL`, or `REUSABLE_KNOWLEDGE`.
- `risk_level`: `MINIMAL`, `LOW`, `MEDIUM`, `HIGH`, or `CRITICAL`.
- `risk_score`: numeric severity from 1 to 5.
- `recommendation`: storage and reuse guidance.
- `possible_sensitive_data`: detector names that matched.
- `requires_human_approval`: true for sensitive, confidential, or personal data.

## Distillation Rules

The distiller extracts:

- Learnings.
- Decisions.
- Tasks.
- Risks.
- Opportunities.
- Open questions.
- Reusable knowledge atoms.

Sensitive text is redacted before persistence. If input is personal, sensitive, or confidential, raw input retention is blocked and only redacted classified/distilled records are eligible for local storage.

## Writer Guardrails

The writer:

- Writes only to approved `memory/` paths.
- Blocks `.env` style paths.
- Blocks credential-like content.
- Updates `learning_atoms.json`.
- Updates `knowledge_index.json`.
- Requires classification before storing private or sensitive content.

## Reader and RAG Preparation

The reader can:

- Read the knowledge index.
- Read learning atoms.
- Search by project, category, topic, or free-text query.
- Return a future RAG seed format with `text` plus metadata.

No embedding generation or vector storage is included in v1.

## Explicit Non-Goals

- No external APIs.
- No OpenAI, Claude, Gemini, or other model connections.
- No fine-tuning.
- No automatic ingestion of real private data.
- No push or remote sync.
- No credential handling.

## Review Checklist

- Memory structure exists.
- Config exists.
- Classifier exists.
- Distiller exists.
- Reader and writer exist.
- Build passes.
- No real data is stored.
- Human approval remains required for sensitive data.

