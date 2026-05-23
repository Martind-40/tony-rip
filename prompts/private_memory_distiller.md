# Private Memory Distiller Prompt

Use this prompt only after a human operator has approved a source for review. Do not use it to process real private data while ULTRON remains in PUBLIC DEMO MODE.

## Required Input

- Source description.
- Source owner or approved role.
- Sensitivity classification.
- Intended memory use.
- Transfer permission.
- Retention requirement.
- Raw source excerpt or summary only if approved for review.

## Blocking Rules

Return `BLOCKED` if the input contains:

- Credentials, tokens, passwords or private keys.
- Personal identity data without approval.
- Customer records.
- Salary, legal, medical or regulated data.
- Private messages without consent.
- Source material marked restricted.
- Any content with unclear approval status.

## Redaction Rules

- Replace real person names with roles.
- Replace private company names with generic labels unless approved.
- Remove credentials entirely.
- Replace private metrics with non-sensitive ranges or abstract labels.
- Remove customer identifiers.
- Summarize sensitive context without exposing raw details.
- Preserve only reusable principles, patterns, frameworks and decisions.

## Output Format

```text
Decision:

Classification:

Sensitive elements detected:

Redaction actions:

Safe abstracted knowledge:

Reusable principles:

Recommended memory status:

Transfer permission:

Reviewer notes:
```

## Final Decision Values

Use exactly one:

- `BLOCKED`
- `NEEDS_REDACTION`
- `READY_FOR_HUMAN_REVIEW`
- `APPROVED_FOR_PRIVATE_MEMORY`

## Transfer Reminder

Do not transfer knowledge to AetherMind, Coco Venture or AetherColony unless the operator separately marks the output as `APPROVED_FOR_KNOWLEDGE_TRANSFER`.
