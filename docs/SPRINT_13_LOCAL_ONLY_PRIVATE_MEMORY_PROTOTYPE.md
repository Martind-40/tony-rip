# Sprint 13 — Local-Only Private Memory Prototype

## 1. Objective

Create a visual and documentary prototype of local-only private memory using mock data only.

This sprint does not create real private memory. There is no real data, no backend, no auth, no APIs, no cloud, no autonomous agents and no sensitive persistence. This sprint only creates simulated structure.

## 2. Prototype Scope

- Mock memory inbox.
- Mock classification.
- Mock approval status.
- Mock distilled knowledge.
- Mock audit log.
- No real storage.
- No sensitive data.
- No external integrations.

## 3. Mock Memory Flow

```text
Input mock → Classification → Redaction check → Human approval mock → Distilled knowledge → Mock memory record → Mock audit log
```

## 4. Mock Data Model

| Field | Purpose | Example | Status |
|---|---|---|---|
| id | Memory item identifier | MEM-001 | Mock |
| source_type | Origin category | manual_note | Mock |
| sensitivity | Risk level | public_mock / private_mock | Mock |
| classification | Data class | pure_knowledge | Mock |
| approval_status | Review state | APPROVED_MOCK | Mock |
| distilled_summary | Safe reusable knowledge | Generic lesson learned | Mock |
| raw_data | Original sensitive content | NOT_STORED | Blocked |
| created_at | Timestamp | demo timestamp | Mock |
| audit_status | Trace state | LOGGED_MOCK | Mock |

## 5. Allowed Mock States

- `DRAFT_MOCK`
- `PENDING_REVIEW_MOCK`
- `NEEDS_REDACTION_MOCK`
- `APPROVED_MOCK`
- `REJECTED_MOCK`
- `STORED_AS_KNOWLEDGE_MOCK`
- `BLOCKED_MOCK`

## 6. Memory Boundary Rules

- Raw sensitive data must not be stored.
- Credentials must never be stored.
- Company documents must not be stored.
- Personal data must not be stored.
- Only distilled generic knowledge can be represented.
- Every item must show approval status.
- Every item must show mock-only label.

## 7. Example Mock Records

### MEM-001

- Source: `manual_note`
- Classification: `pure_knowledge`
- Approval: `APPROVED_MOCK`
- Summary: "When presenting a public AI demo, clearly separate current capabilities from future capabilities."

### MEM-002

- Source: `operator_feedback`
- Classification: `product_learning`
- Approval: `STORED_AS_KNOWLEDGE_MOCK`
- Summary: "Demo users need visible labels for blocked features to avoid assuming production readiness."

### MEM-003

- Source: `sensitive_input_example`
- Classification: `blocked_sensitive`
- Approval: `BLOCKED_MOCK`
- Summary: "Raw sensitive input was not stored. It requires redaction before any future memory action."

## 8. UI Requirements

Add a visual section:

Local-Only Private Memory Prototype

Must show:

- Memory mode: `MOCK_ONLY`
- Storage: `NOT_IMPLEMENTED`
- Raw data: `NOT_STORED`
- Approval: `HUMAN_REVIEW_REQUIRED`
- Backend: `NOT_CONNECTED`
- APIs: `NOT_CONNECTED`
- Agents: `BLOCKED`

Mock table:

| Memory Item | Classification | Approval | Storage |
|---|---|---|---|
| MEM-001 | pure_knowledge | APPROVED_MOCK | MOCK_ONLY |
| MEM-002 | product_learning | STORED_AS_KNOWLEDGE_MOCK | MOCK_ONLY |
| MEM-003 | blocked_sensitive | BLOCKED_MOCK | NOT_STORED |

Visible note:

"This is a local-only memory prototype using mock data. No real private data, credentials, backend, authentication, APIs, cloud storage, or autonomous agents are connected."

## 9. Audit Log Mock

| Event | Status | Notes |
|---|---|---|
| Memory item created | MOCK_LOGGED | Demo only |
| Classification assigned | MOCK_LOGGED | No real data |
| Human approval checked | MOCK_REQUIRED | Simulated |
| Sensitive raw data blocked | MOCK_BLOCKED | Not stored |
| Knowledge stored | MOCK_ONLY | No persistence |

## 10. Sprint 14 Readiness

Sprint 14 — Approval Queue Prototype

Should build:

- Visual approval queue.
- Mock states.
- Approve/reject as simulated UI if safe.
- No real execution.
- No real persistence.
- No real agents.
