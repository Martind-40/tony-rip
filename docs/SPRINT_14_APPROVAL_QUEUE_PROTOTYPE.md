# Sprint 14 — Approval Queue Prototype

## 1. Objective

Create a mock human approval queue prototype for future sensitive actions.

This sprint does not implement:

- Real execution.
- Real agents.
- Backend.
- Auth.
- APIs.
- Real memory.
- Real persistence.
- Connection to real data.

## 2. Approval Queue Purpose

The Approval Queue represents mandatory human control before any future sensitive action.

It covers:

- Reviewing requests.
- Classifying risk.
- Approving or rejecting in mock mode.
- Blocking sensitive actions.
- Registering mock events.
- Keeping visual traceability.

## 3. Mock Approval Flow

```text
Request created → Risk classification → Human review → Approve/Reject/Block → Mock audit log → No real execution
```

## 4. Approval States

- `PENDING_REVIEW_MOCK`
- `APPROVED_MOCK`
- `REJECTED_MOCK`
- `BLOCKED_MOCK`
- `NEEDS_REDACTION_MOCK`
- `EXECUTION_DENIED_MOCK`
- `MOCK_LOGGED`

## 5. Mock Request Model

| Field | Purpose | Example | Status |
|---|---|---|---|
| request_id | Approval item ID | APR-001 | Mock |
| request_type | Type of requested action | memory_write | Mock |
| risk_level | Risk classification | low / medium / high / critical | Mock |
| requested_action | What would happen in future | Store distilled knowledge | Mock |
| approval_status | Human review state | PENDING_REVIEW_MOCK | Mock |
| execution_status | Whether action runs | NOT_EXECUTED | Blocked |
| audit_status | Trace status | MOCK_LOGGED | Mock |

## 6. Example Mock Requests

### APR-001

- Type: `memory_write`
- Risk: `medium`
- Status: `PENDING_REVIEW_MOCK`
- Execution: `NOT_EXECUTED`
- Note: Future memory write requires human approval.

### APR-002

- Type: `sensitive_data_intake`
- Risk: `critical`
- Status: `BLOCKED_MOCK`
- Execution: `DENIED`
- Note: Raw sensitive data cannot be stored.

### APR-003

- Type: `agent_action`
- Risk: `high`
- Status: `EXECUTION_DENIED_MOCK`
- Execution: `DENIED`
- Note: Autonomous agents remain blocked.

### APR-004

- Type: `public_demo_note`
- Risk: `low`
- Status: `APPROVED_MOCK`
- Execution: `MOCK_ONLY`
- Note: Safe public demo note approved as mock.

## 7. Human Approval Rules

- No sensitive action can execute without approval.
- Approval does not execute anything in this sprint.
- Rejected actions remain blocked.
- Critical-risk requests are blocked by default.
- Credentials are always rejected.
- Raw company/client/personal data is always blocked.
- Agent actions are always denied until future architecture exists.

## 8. UI Requirements

Add a visual block:

Approval Queue Prototype

Must show:

- Queue mode: `MOCK_ONLY`
- Execution: `DISABLED`
- Human approval: `REQUIRED`
- Agents: `BLOCKED`
- Real actions: `NOT_CONNECTED`
- Audit: `MOCK_LOGGED`

Mock table:

| Request | Type | Risk | Approval | Execution |
|---|---|---|---|---|
| APR-001 | memory_write | medium | PENDING_REVIEW_MOCK | NOT_EXECUTED |
| APR-002 | sensitive_data_intake | critical | BLOCKED_MOCK | DENIED |
| APR-003 | agent_action | high | EXECUTION_DENIED_MOCK | DENIED |
| APR-004 | public_demo_note | low | APPROVED_MOCK | MOCK_ONLY |

Visible note:

"This approval queue is a mock prototype. No real actions, agents, memory writes, backend, APIs, authentication, or private data are connected."

## 9. Audit Log Mock

| Event | Status | Notes |
|---|---|---|
| Approval request created | MOCK_LOGGED | Demo only |
| Risk classified | MOCK_LOGGED | No real processing |
| Human review required | MOCK_REQUIRED | Simulated gate |
| Sensitive request blocked | MOCK_BLOCKED | No storage |
| Execution denied | MOCK_DENIED | No real action |

## 10. Sprint 15 Readiness

Sprint 15 — Controlled Private Mode MVP

Should unite:

- Private Architecture Blueprint.
- Local-Only Private Memory Prototype.
- Approval Queue Prototype.
- Safety boundaries.
- No real backend/auth/APIs yet unless explicitly approved later.
