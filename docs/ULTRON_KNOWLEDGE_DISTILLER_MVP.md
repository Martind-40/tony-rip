# ULTRON Knowledge Distiller MVP

## Status

KNOWLEDGE_DISTILLER_MVP_READY

## Purpose

Convert notes or approved local text into reusable knowledge while redacting obvious sensitive patterns.

## Added

- `runtime/knowledge_distiller.cjs`
- Email redaction.
- Numeric secret-like redaction.
- Token/key/password pattern redaction.
- Private key block redaction.
- Output status: `READY_FOR_HUMAN_REVIEW`.

## Use

```bash
node runtime/knowledge_distiller.cjs <local_text_file_inside_ultron>
```

## Boundaries

- Input must be inside `/Users/macbook/ultron`.
- No API calls.
- No model calls.
- No automatic transfer.
- Transfer to AetherMind, Coco Venture or AetherColony remains blocked until human approval.
