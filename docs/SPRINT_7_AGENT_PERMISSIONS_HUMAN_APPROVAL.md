# Sprint 7 - Agent Permissions and Human Approval Model

Status: READY FOR REVIEW
Mode: PUBLIC DEMO MODE
Private Mode: NOT_READY
Autonomous agents: BLOCKED
Implementation status: Documentation only

## Purpose

Sprint 7 defines how ULTRON will reason about future agent permissions before any real or autonomous agents are created. The goal is to clarify what an agent may do, what is blocked, what requires human approval and how risky actions are stopped by default.

This sprint does not create functional agents.

## What An Agent Means In ULTRON

An ULTRON agent is a future role-specific assistant with a defined purpose, inputs, outputs, permissions, limits and approval requirements. In the current public demo, agents are conceptual design objects only.

Agents may be used to describe future responsibilities such as memory review, knowledge distillation, routing, security review or operator assistance.

## What An Agent Is Not Yet

An ULTRON agent is not yet:

- An autonomous executor.
- A background worker.
- A tool-connected service.
- An email sender.
- A file mover.
- A credential user.
- A private data processor.
- A production system operator.

## Permission Levels

| Level | Meaning | Current Decision |
|---|---|---|
| OBSERVE_ONLY | Can inspect approved public-safe context. | Allowed for design |
| SUGGEST_ONLY | Can propose ideas, structure or next steps. | Allowed for design |
| DRAFT_ONLY | Can draft documents, checklists or policies for review. | Allowed for design |
| HUMAN_APPROVED_ACTION | Can act only after explicit human approval and manual execution path. | Future only |
| AUTONOMOUS_ACTION_BLOCKED | Any autonomous execution is blocked. | Default |

## Actions Allowed Now

- Read documentation that is already public-safe in the repo.
- Propose structure.
- Generate drafts.
- Create checklists.
- Suggest future agents.
- Define permission boundaries.
- Flag security risks.

## Actions Blocked

- Execute real actions.
- Send emails.
- Move sensitive files.
- Modify private data.
- Connect to external tools.
- Create autonomous agents.
- Use credentials.
- Process real company or personal data.
- Trigger background jobs.

## Human Approval Model

Any future agent capability must follow this path:

1. Proposal.
2. Review.
3. Risk classification.
4. Explicit approval.
5. Manual execution by operator.
6. Registration in a reviewable log.

If risk, scope, source, output or approval status is unclear, the default decision is `BLOCKED`.

## Risk Classification

| Risk | Description | Default Decision |
|---|---|---|
| Low | Public-safe drafting or checklist work. | Design allowed |
| Medium | Internal workflow proposal without real data. | Needs review |
| High | Private data, file changes, external tools or credentials. | Blocked |
| Critical | Autonomous execution, secrets, customer data or destructive action. | Blocked |

## Risks

- Agents receive tool access before policy approval.
- Proposal-only agents are mistaken for live agents.
- Human approval is skipped during future automation.
- Private data enters public prompts or memory files.
- Agent permissions become broader than their stated purpose.
- External tools are connected before auth, logging and rollback exist.

## Close Criteria

- Permission levels documented.
- Blocked actions documented.
- Human approval model documented.
- Agent permissions policy created and validated.
- Conceptual agent permission matrix created.
- Review prompt created.
- Build remains passing.
- Autonomous agents remain blocked.

## Decision

No autonomous agents are activated in Sprint 7. ULTRON remains in PUBLIC DEMO MODE, Private Mode remains NOT_READY and all future agent actions default to `BLOCKED` unless explicitly approved.

Recommended next phase: Sprint 8 - Public Demo QA and Security Boundary Review.
