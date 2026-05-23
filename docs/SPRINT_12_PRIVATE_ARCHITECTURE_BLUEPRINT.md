# Sprint 12 — Private Architecture Blueprint

## 1. Objective

Design the future Private Mode architecture without implementing it yet.

Private Mode remains `NOT_READY`. There is no backend, no auth, no APIs, no real data, no real private memory and no active autonomous agents. This sprint defines a technical blueprint only.

## 2. Architecture Principles

- Human approval first.
- Local/private-first storage.
- Data minimization.
- Knowledge distillation before memory.
- No raw sensitive data sharing.
- Auditability.
- Explicit permissions.
- Reversible actions.
- No autonomous execution without approval.

## 3. Proposed Private Mode Layers

| Layer | Purpose | Current Status | Future Requirement |
|---|---|---|---|
| Private Workspace | Private operator area | NOT_READY | Secure local/private environment |
| Data Intake | Manual/controlled information intake | DESIGN_ONLY | Classification before storage |
| Knowledge Distiller | Converts data into reusable knowledge | DESIGN_ONLY | Redaction and abstraction rules |
| Memory Layer | Stores approved knowledge | NOT_CONNECTED | Local/private persistence |
| Approval Queue | Human review before sensitive actions | NOT_CONNECTED | Mandatory gate |
| Agent Permissions | Defines agent limits | DOCUMENTED | Runtime enforcement |
| Audit Log | Records actions and decisions | MOCK_ONLY | Tamper-resistant logs |
| External Integrations | Future connections | BLOCKED | Approved APIs only |

## 4. Data Classification Model

| Class | Description | Allowed in Public Demo | Future Private Handling |
|---|---|---|---|
| Public Knowledge | Non-sensitive information | Yes | Allowed |
| Pure Knowledge | Learnings without raw data | Yes, if generic | Preferred memory format |
| Personal Data | Personal information | No | Requires approval/redaction |
| Company Data | Internal work information | No | Requires private environment |
| Credentials | Passwords/API keys/tokens | Never | Never store |
| Client Data | Customer/client information | No | Strict controls |
| Raw Documents | Complete internal documents | No | Intake + distillation only |

## 5. Memory Boundary Rules

- Never store credentials.
- Never store full internal documents as final memory.
- Convert sensitive data into abstract knowledge.
- Separate raw input from distilled knowledge.
- Require human approval for every private memory item.
- Every deletion must be possible.
- Every change must be audited.

## 6. Approval Gate Design

Flow:

```text
Request → Classification → Risk Check → Human Review → Approve/Reject → Execute/Store → Audit Log
```

States:

- `PENDING_REVIEW`
- `APPROVED`
- `REJECTED`
- `BLOCKED`
- `NEEDS_REDACTION`
- `STORED_AS_KNOWLEDGE`
- `EXECUTION_DENIED`

## 7. Agent Execution Boundaries

| Agent Capability | Current Status | Future Rule |
|---|---|---|
| Read public docs | DEMO_ONLY | Allowed with approval |
| Read private docs | BLOCKED | Requires private mode |
| Write memory | BLOCKED | Requires approval |
| Send messages | BLOCKED | Requires explicit confirmation |
| Modify files | BLOCKED | Requires scoped permission |
| Use APIs | BLOCKED | Requires approved integration |
| Autonomous actions | BLOCKED | Not allowed without human gate |

## 8. Storage Options

| Option | Pros | Cons | Recommendation |
|---|---|---|---|
| Local JSON/Markdown | Simple, transparent | Limited security | Good for prototype |
| Local SQLite | Structured, portable | Needs schema | Good for MVP |
| Encrypted local store | Safer | More complexity | Future preferred |
| Cloud DB | Scalable | Higher risk | Not now |
| Supabase/Firebase | Fast backend | Not allowed yet | Future only after approval |

Recommendation: Sprint 13 should use a local-only prototype, preferably Markdown/JSON or SQLite mock, without real data.

## 9. Security Assumptions

- User operates locally.
- No external services are connected.
- No credentials are stored.
- No real corporate information is processed.
- Every sensitive flow requires human approval.
- The system must fail closed, not open.

## 10. Non-Goals

- Do not implement Private Mode.
- Do not create backend.
- Do not create login.
- Do not connect APIs.
- Do not store real memory.
- Do not execute agents.
- Do not process real data.

## 11. Sprint 13 Readiness

Sprint 13 — Local-Only Private Memory Prototype

Should allow:

- Simulated local structure.
- Mock data.
- Manual classification.
- Fake/demo distilled memory.
- Mock approval status.
- Mock audit log.

Must not allow:

- Real data.
- Cloud services.
- APIs.
- Credentials.
- Autonomous agents.
