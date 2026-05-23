# Private Mode Checklist Prompt

Use this prompt before proposing any transition from PUBLIC DEMO MODE to PRIVATE MODE.

## Operator Input

Provide:

- Proposed source name.
- Source owner.
- Data type.
- Sensitivity level.
- Intended ULTRON use.
- Storage plan.
- Access plan.
- Retention and deletion plan.
- Whether the repo and deployment are public or private.

## Required Review

Answer each item with `PASS`, `BLOCKED` or `NEEDS REVIEW`.

| Check | Status | Notes |
|---|---|---|
| Source owner identified |  |  |
| Data classification assigned |  |  |
| No credentials included |  |  |
| No personal data included without approval |  |  |
| Storage location approved |  |  |
| Access control defined |  |  |
| Deletion process defined |  |  |
| Audit requirements defined |  |  |
| Output boundaries defined |  |  |
| Transfer restrictions documented |  |  |

## Decision Rules

- If any credential is present, decision is `BLOCKED`.
- If personal data is present without explicit approval, decision is `BLOCKED`.
- If the repo remains public and the source is not public-safe, decision is `BLOCKED`.
- If storage, access or deletion is unknown, decision is `NEEDS REVIEW`.
- Private Mode can only proceed after explicit human approval.

## Final Output

Return:

- Decision: `APPROVED FOR PRIVATE MODE REVIEW`, `NEEDS REVIEW` or `BLOCKED`.
- Main risks.
- Required corrections.
- Approved scope, if any.
- Items that must not be transferred to AetherMind, Coco Venture or AetherColony.
