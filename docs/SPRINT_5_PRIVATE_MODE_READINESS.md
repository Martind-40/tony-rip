# Sprint 5 - Private Mode Readiness Plan

Status: READY FOR REVIEW
Mode: PUBLIC DEMO MODE
Implementation status: Documentation only

## Purpose

Sprint 5 prepares ULTRON for a future transition from public demo to private mode without enabling private processing yet. This sprint defines boundaries, approval gates, data rules and the roadmap needed before any real work context, backend, authentication or private memory is connected.

## Public Demo Mode

Public Demo Mode means ULTRON can only show generic examples and public-safe scaffolding. It may explain the operating model, command center, memory layer, project routing and proposed agents, but it must not process private company data, personal data, credentials or real internal documents.

Allowed in Public Demo Mode:

- Public-safe UI copy.
- Placeholder project examples.
- Generic memory templates.
- Non-sensitive operating policies.
- Future roadmap documentation.

Not allowed in Public Demo Mode:

- Real company documents.
- Personal information.
- Credentials, tokens or API keys.
- Private work notes.
- Production integrations.
- Autonomous execution.

## Private Mode Definition

Private Mode will mean ULTRON is approved to process defined categories of real work context inside a controlled environment. Private Mode requires explicit human approval, access control, storage policy, secret handling, audit rules and a clear data deletion process.

Private Mode is not active in this sprint.

## Future Data Scope

ULTRON may process these data types only after Private Mode approval:

- Work tasks and operating notes approved for ULTRON use.
- Project plans and decision records approved by the operator.
- Meeting summaries after consent and redaction review.
- Knowledge snippets manually added to private memory.
- Public market or research material with source labels.

ULTRON must not process these without explicit approval:

- Credentials, secrets or private keys.
- Payroll, health, identity or financial personal data.
- Legal documents unless reviewed and approved.
- Customer records or production datasets.
- Confidential company strategy.
- Private messages from third parties without consent.

## Checklist Before Private Mode

- [ ] Repository privacy decision completed.
- [ ] Data classification policy approved.
- [ ] Access control model selected.
- [ ] Secret handling policy approved.
- [ ] Private memory storage location selected.
- [ ] Backup and deletion policy defined.
- [ ] Audit log requirements defined.
- [ ] Human approval workflow documented.
- [ ] Redaction process tested manually.
- [ ] Deployment settings reviewed.
- [ ] Git history checked for sensitive content.
- [ ] No backend, auth or integration is enabled before approval.

## Security Risks

- Accidental upload of private notes into a public repo.
- Secrets committed to source control.
- Private work data mixed with demo copy.
- Future agents receiving broad permissions too early.
- Memory layer storing unreviewed personal data.
- Vercel logs or build output exposing sensitive values.
- Knowledge transfer into adjacent projects without source boundaries.

## Knowledge Transfer Rules

ULTRON may transfer pure, non-sensitive knowledge patterns to AetherMind, Coco Venture and AetherColony only when the content is abstracted and source-safe.

Allowed transfer:

- Generic operating principles.
- Public-safe checklists.
- Non-sensitive UX patterns.
- Documentation templates.
- Lessons learned without private facts.

Blocked transfer:

- Company-specific facts.
- Personal data.
- Credentials.
- Internal strategy.
- Private documents.
- Unredacted meeting notes.

Every transfer must include:

- Source context.
- Sensitivity classification.
- Human approval status.
- Destination project.
- Redaction notes.

## Human Approval Protocol

Before connecting any real source, the operator must approve:

1. Source name and owner.
2. Data type and sensitivity level.
3. Intended ULTRON use.
4. Storage location.
5. Retention period.
6. Access permissions.
7. Deletion plan.
8. Allowed outputs.
9. Transfer restrictions.

If any item is unknown, the source remains blocked.

## Future Roadmap

Private Mode can be reconsidered only after this order of work:

1. Data boundary approval.
2. Repository privacy decision.
3. Authentication design.
4. Private memory design.
5. Backend selection, if needed.
6. Secret management process.
7. Agent permission model.
8. Audit log and rollback process.
9. Manual pilot with synthetic or redacted data.
10. Human readiness review.

## Decision

Sprint 5 does not activate Private Mode. ULTRON remains in PUBLIC DEMO MODE.

Recommended next phase: Sprint 6 - Manual Private Memory Workflow Design.
