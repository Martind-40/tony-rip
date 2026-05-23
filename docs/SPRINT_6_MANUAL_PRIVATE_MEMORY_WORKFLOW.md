# Sprint 6 - Manual Private Memory Workflow Design

Status: READY FOR REVIEW
Mode: PUBLIC DEMO MODE
Private Mode: NOT_READY
Implementation status: Documentation and templates only

## Purpose

Sprint 6 designs the future manual private memory workflow for ULTRON without activating Private Mode. The goal is to define how a human operator will submit, classify, redact, approve and store private knowledge later, while keeping the current repository public-safe.

This sprint does not process real private data.

## What Manual Private Memory Means

Manual private memory is a future workflow where a human operator intentionally submits an approved source, classifies it, removes or blocks sensitive details, extracts reusable knowledge and approves the final distilled output before it is stored in private memory.

Manual private memory is designed to keep raw source material separate from reusable knowledge.

## What Manual Private Memory Is Not

Manual private memory is not:

- Automatic ingestion.
- Background scraping.
- A vector database.
- A backend service.
- Authentication.
- A credential store.
- A place for raw private documents.
- A place for personal data without approval.
- An autonomous agent workflow.

## Future Proposed Flow

1. Human operator submits source manually.
2. Source gets classified.
3. Sensitive details are blocked or redacted.
4. Only pure knowledge is extracted.
5. Human approves distilled output.
6. Approved output goes to private memory.
7. Transfer to AetherMind, Coco Venture or AetherColony remains blocked unless separately approved.

## Data Classification

| Level | Meaning | Default Decision |
|---|---|---|
| PUBLIC | Safe for public demos and public repos. | Allowed |
| INTERNAL | Work context that is not public but may be used after approval. | Needs review |
| CONFIDENTIAL | Sensitive work, customer, financial, strategic or legal material. | Needs redaction and approval |
| RESTRICTED | Secrets, credentials, identity data, regulated data or highly sensitive records. | Blocked |

## Review States

| State | Meaning |
|---|---|
| BLOCKED | Source or output cannot be used. |
| NEEDS_REDACTION | Sensitive details must be removed before review. |
| READY_FOR_HUMAN_REVIEW | Distilled output is ready for operator review. |
| APPROVED_FOR_PRIVATE_MEMORY | Human approved the safe distilled output for private memory. |
| APPROVED_FOR_KNOWLEDGE_TRANSFER | Human approved abstracted knowledge transfer to another project. |

## Pure Knowledge Allowed

The future private memory may store approved, redacted and abstracted knowledge such as:

- Principles.
- Learnings.
- Frameworks.
- Checklists.
- Patterns of work.
- Abstract decisions.

## Content That Must Not Be Stored

The future private memory must not store:

- Names of real people.
- Raw internal documents.
- Private metrics or financial figures.
- Credentials.
- Private messages.
- Customer data.
- Sensitive legal, salary or financial information.
- Unapproved source excerpts.

## Redaction Protocol

Before any output can move forward:

1. Detect sensitive elements.
2. Replace specific names, companies, amounts, dates and identifiers with generic labels.
3. Remove credentials and secrets entirely.
4. Summarize blocked content without exposing details.
5. Preserve only abstract and reusable knowledge.
6. Mark uncertainty and missing context explicitly.
7. Send the safe output to human review.

## Human Approval Protocol

Human approval is required before:

- Storing any distilled output in private memory.
- Using internal, confidential or restricted sources.
- Transferring knowledge to AetherMind, Coco Venture or AetherColony.
- Creating any future automation around memory.
- Connecting any real source, backend, database or API.

Approval must record:

- Reviewer.
- Source type.
- Classification.
- Redaction status.
- Storage permission.
- Transfer permission.
- Retention and deletion notes.

## Risks

- Raw private data accidentally stored as memory.
- Personal data retained without consent.
- Credentials copied into notes or prompts.
- Abstracted knowledge still revealing source identity.
- Transfer into another project without approval.
- Future automation bypassing human review.
- Public repo receiving private memory content by mistake.

## Sprint 6 Close Criteria

- Manual workflow documented.
- Policy JSON created and validated.
- Empty private memory template created.
- Empty redaction review template created.
- Private memory distiller prompt created.
- Build remains passing.
- Private Mode remains NOT_READY.

## Decision

Sprint 6 does not activate Private Mode. ULTRON remains in PUBLIC DEMO MODE, and the manual private memory workflow remains design-only until a future human approval gate is completed.

Recommended next phase: Sprint 7 - Human Approval and Redaction QA.
