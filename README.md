# ULTRON

**ULTRON** is a public-mode foundation for a Knowledge Operator, Work Assistant and Agent Commander.

This repository is intentionally safe for public visibility:

- No real company data.
- No personal data.
- No credentials.
- No private documents.
- No production integrations.

The project is designed to start in **PUBLIC MODE** and later move to **PRIVATE MODE** when real work context, private memory and secure integrations are introduced.

---

## Current Goal

Build a lightweight, zero-cost command center before May 26:

- Command Center.
- Memory Layer.
- Knowledge Distiller.
- Project Router.
- Agent Factory.
- Autonomy Policy.
- Future Interface Roadmap.

Sprint 1 focuses on operational UX hardening:

- Daily Brief.
- Tasks.
- Knowledge Vault.
- Project Router.
- Agent Factory.
- Reports.
- Future Capabilities.

Sprint 2 focuses on deployment readiness:

- Verify Vercel build settings.
- Document public demo mode.
- Confirm zero-secret deployment posture.
- Keep private-mode work gated.

---

## Stack

- Vite + React.
- Plain CSS.
- Markdown and JSON memory.
- Prepared for Vercel.
- No Firebase.
- No Supabase.
- No LangChain.
- No CrewAI.
- No Flowise.
- No Docker.

---

## Structure

```text
ultron/
├── app/
├── agents/
├── core/
├── memory/
├── modelfile/
├── outputs/
├── prompts/
└── router/
```

---

## Run The App

```bash
cd app
npm install
npm run dev
```

Build:

```bash
cd app
npm install
npm run build
```

Vercel Dashboard Mode uses `/app` as the project root:

```json
{
  "framework": "vite",
  "installCommand": "npm install",
  "buildCommand": "npm run build",
  "outputDirectory": "dist"
}
```

Recommended Vercel project settings:

```text
Framework Preset: Vite
Root Directory: app
Install Command: npm install
Build Command: npm run build
Output Directory: dist
```

The Vercel config file lives at `app/vercel.json` to match Dashboard Mode. The repository root does not need a Vercel config file for this setup.

---

## Public Demo Mode

The current app is safe to deploy as a public demo.

Public Demo Mode means:

- UI content is generic and non-sensitive.
- Example workstreams are placeholders.
- No real company data is shown.
- No personal data is shown.
- No credentials or environment variables are required.
- No backend or database is connected.
- No autonomous execution is enabled.

Allowed demo use:

- Show the command center layout.
- Explain the Memory Layer concept.
- Demonstrate routing categories.
- Present future agent proposals.
- Discuss private-mode readiness requirements.

Not allowed in public demo:

- Upload real work documents.
- Paste private notes.
- Add client/company-specific strategy.
- Add secrets or tokens.
- Connect production systems.

---

## Before Going Private

Complete this checklist before moving from PUBLIC MODE to PRIVATE MODE:

- [ ] Define data classification: public, internal, confidential, restricted.
- [ ] Define where private memory will live.
- [ ] Define secret handling and environment variable policy.
- [ ] Add access control for any deployed private version.
- [ ] Create private-mode redaction rules.
- [ ] Create backup and deletion policy.
- [ ] Decide whether the repo must become private.
- [ ] Review deployment logs and build settings.
- [ ] Confirm no private data exists in Git history.
- [ ] Add human approval rules for any future automation.

---

## Sprint 8 — Private Mode MVP Preparation

Sprint 8 adds a public-safe visual structure for the future Private Mode MVP.

Implemented:

- Private Mode status panel.
- Manual Private Memory readiness panel.
- Human Approval Gate summary.
- Future MVP component list.
- Critical boundary list.
- Component matrix for prepared, blocked and pending areas.

Still blocked:

- Backend.
- Authentication.
- Real data access.
- Private memory persistence.
- External APIs.
- Autonomous agents.

Security limits:

- No company data.
- No personal data.
- No credentials or API keys.
- No client documents.
- No private tool execution.

Next recommended sprint: Sprint 9 — Public Demo Final QA + Release Closeout.

---

## Sprint 9 — Public Demo Final QA + Release Closeout

ULTRON remains in Public Demo Mode. The current release is safe for public presentation because it does not include real private data, credentials, backend services, authentication, APIs, autonomous agents, or private memory persistence. Private Mode, Manual Private Memory, and Autonomous Agent execution remain blocked until a future controlled architecture is approved.

Final demo state:

- Sprint 0 through Sprint 9 are closed or ready for closeout.
- Public Demo UI is stable and visible.
- Private Mode is preparation-only.
- Manual Private Memory is design-only.
- Agent permissions are documented.
- Backend, auth, APIs and autonomous agents remain blocked.

### ULTRON Public Demo Release Status

| Area | Status | Notes |
|---|---|---|
| Public Demo UI | READY | Stable visual command center |
| Private Mode | NOT_READY | Preparation only |
| Manual Private Memory | DESIGN_ONLY | No real persistence |
| Agent Permissions | DOCUMENTED | No real execution |
| Backend | NOT_CONNECTED | Blocked |
| Auth | NOT_CONNECTED | Blocked |
| APIs | NOT_CONNECTED | Blocked |
| Autonomous Agents | BLOCKED | Future phase only |
| Public Presentation | READY | Safe demo narrative |

Next recommended sprint: Sprint 10 — Private Architecture Decision Gate.

---

## Sprint 10 — Public Demo Presentation Pack

Status: COMPLETED / PRESENTATION_READY

Document created: `docs/SPRINT_10_PUBLIC_DEMO_PRESENTATION_PACK.md`

Use: executive presentation of the public demo.

The demo remains in PUBLIC DEMO MODE. Private Mode remains NOT_READY. Manual Private Memory remains DESIGN_ONLY. Autonomous Agents remain BLOCKED. There is no backend, no auth, no APIs and no real data.

| Asset | Status | Notes |
|---|---|---|
| Presentation Pack | READY | Executive demo narrative |
| 3-Minute Script | READY | Demo walkthrough |
| 60-Second Pitch | READY | Short executive pitch |
| Demo Checklist | READY | Before/during/after guide |
| Safety Talking Points | READY | Public-safe positioning |
| Roadmap | READY | Future sprint direction |

---

## Sprint 11 — Feedback Capture & Demo Iteration

Status: COMPLETED / DEMO_ITERATION_READY

Objective: improve clarity of the public demo from an external viewer perspective.

Document created: `docs/SPRINT_11_FEEDBACK_CAPTURE_DEMO_ITERATION.md`

Changes:

- Feedback capture matrix.
- Reviewer questions.
- Current Reality vs Future Capability framing.
- Stronger public-demo-only safety line.

Limits remain unchanged: no backend, no auth, no APIs, no real data, no private memory persistence and no autonomous agents.

---

## Sprint 12 — Private Architecture Blueprint

Status: COMPLETED / BLUEPRINT_READY

Document created: `docs/SPRINT_12_PRIVATE_ARCHITECTURE_BLUEPRINT.md`

The blueprint defines future Private Mode layers, security limits, data classification, approval gates, memory boundaries and storage options. Private Mode remains NOT_READY. There is no real private implementation, no backend, no auth, no APIs, no real memory and no autonomous agents.

Recommended next sprint: Sprint 13 — Local-Only Private Memory Prototype.

---

## Sprint 13 — Local-Only Private Memory Prototype

Status: COMPLETED / MOCK_PROTOTYPE_READY

Document created: `docs/SPRINT_13_LOCAL_ONLY_PRIVATE_MEMORY_PROTOTYPE.md`

Sprint 13 adds a local-only mock prototype for private memory structure. It uses mock records, mock classification, mock approval status and mock audit log language only.

Limits remain unchanged: no real data, no backend, no auth, no APIs, no cloud, no real private memory and no autonomous agents.

Recommended next sprint: Sprint 14 — Approval Queue Prototype.

---

## Sprint 14 — Approval Queue Prototype

Status: COMPLETED / MOCK_APPROVAL_READY

Document created: `docs/SPRINT_14_APPROVAL_QUEUE_PROTOTYPE.md`

Sprint 14 adds a mock approval queue for future sensitive actions. It represents human review, risk classification, mock approval states and mock audit logging only.

Limits remain unchanged: no real execution, no real agents, no backend, no auth, no APIs and no real data.

Recommended next sprint: Sprint 15 — Controlled Private Mode MVP.

---

## Sprint 15 — Controlled Private Mode MVP

Status: COMPLETED / MVP_MOCK_READY

Document created: `docs/SPRINT_15_CONTROLLED_PRIVATE_MODE_MVP.md`

Sprint 15 integrates the Private Architecture Blueprint, Local-Only Private Memory Prototype and Approval Queue Prototype into a controlled mock-only Private Mode MVP.

Everything remains mock/demo: no backend, no auth, no APIs, no real data, no real memory, no real persistence and no autonomous agents.

Recommended next step: Public Demo v1 Final Seal.

---

## Sprint 16 — Actionable Operator MVP

Status: FUNCTIONAL_FRONTEND_READY

Document created: `docs/SPRINT_16_ACTIONABLE_OPERATOR_MVP.md`

Sprint 16 turns ULTRON into a minimal usable frontend operator tool while keeping PUBLIC DEMO MODE active.

Implemented:

- Functional Task Console.
- Functional Knowledge Capture.
- Functional mock Approval Queue.
- Browser-only React state with simple demo localStorage.

Limits remain unchanged:

- No backend.
- No auth.
- No APIs.
- No sensitive data.
- No real agents.
- No external execution.

Do not enter private, company, client, credential or sensitive data.

---

## Master Architecture Closeout

Status: PUBLIC_ACTIONABLE_OPERATOR_MVP_CLOSED

ULTRON is closed as a safe public Actionable Operator MVP after Sprint 16.

Current capabilities:

- Task Console.
- Knowledge Capture.
- Mock Approval Queue.
- Demo-only localStorage persistence.

Still blocked:

- Backend.
- Auth.
- APIs.
- Sensitive data.
- Real agents.
- External execution.

Next direction:

Power Layer Prep first, then UI polish after Chief approval.

---

## ULTRON Functional MVP

Status: FUNCTIONAL_MVP_READY

Document created: `docs/ULTRON_FUNCTIONAL_MVP_CLOSEOUT.md`

Operator Core status document: `docs/ULTRON_OPERATOR_CORE_STATUS.md`

Implemented:

- Visible ULTRON Operator Core panel.
- Safe Command Center buttons.
- Browser Action Log with timestamps, results and risk labels.
- Model Router placeholder.
- Human Approval Policy panel.
- Open Source Absorption panel.

Still controlled/mock:

- Safe commands return frontend-controlled results.
- Model Router is a placeholder.
- MCP tools are planned, not connected.

Still blocked:

- Backend.
- Auth.
- APIs.
- Credentials.
- Sensitive data.
- Autonomous agents.
- External execution.

---

## Local Command Bridge

Status: POLICY_READY_NOT_EXECUTING

Document created: `docs/ULTRON_LOCAL_COMMAND_BRIDGE_DESIGN.md`

Local Command Bridge is policy-ready but not executing commands.

Prepared:

- `core/local_command_bridge.policy.json`
- `core/safe_commands.allowlist.json`
- `memory/operator_command_log_TEMPLATE.md`
- UI section for bridge status, allowlisted commands and blocked commands.

Still disabled:

- Real terminal execution.
- Git execution.
- Build execution from UI.
- External network calls.
- Destructive commands.
- Writes outside ULTRON.

---

## Operator Runtime Readiness

Status: DRY_RUN_READY

Document created: `docs/ULTRON_RUNTIME_READINESS_CLOSEOUT.md`

Runtime layer is DRY_RUN_READY. Real execution is disabled.

Prepared:

- Runtime policy guard.
- Safe command allowlist validation.
- Permission validation.
- Protected path checks.
- Blocked command detection.
- Runtime config for DRY_RUN only.
- UI runtime validation actions connected to Action Log.

Still required before real terminal execution:

- Private Mode.
- Explicit Chief approval.
- Reviewed execution gate.
- Action logging.
- Rollback plan for any future write action.

Still blocked:

- Destructive commands.
- Secret access.
- External network calls.
- Autonomous loops.
- Real terminal execution from the UI.

---

## High Power Controlled Local Bridge

Status: HIGH_POWER_CONTROLLED_READY PREPARED / REAL_EXECUTION_DISABLED

Document created: `docs/ULTRON_HIGH_POWER_CONTROLLED_BRIDGE_CLOSEOUT.md`

ULTRON is prepared for a future higher-power local bridge, but real execution remains disabled.

Prepared future capabilities:

- Read files inside `/Users/macbook/ultron`.
- Analyze repo structure.
- Review git status, git log and git diff.
- Run approved validation commands such as build or tests.
- Create or edit files inside ULTRON only after Chief approval.
- Generate local reports and runtime logs.
- Prepare local commits with double confirmation.

Still blocked:

- Git push.
- Secrets, `.env`, `.ssh`, tokens and credentials.
- External network calls.
- Destructive commands.
- Access outside `/Users/macbook/ultron`.
- AetherMind, Coco Venture and AetherColony.
- Autonomous execution.

Every future real action must pass Policy Guard, Approval Queue, explicit Chief confirmation, command logging, output summary and rollback review.

---

## Public Demo Final QA & Controlled Power Closeout

Status: PUBLIC_DEMO_QA_PASSED / CONTROLLED_POWER_STAGE_CLOSED / REAL_EXECUTION_NO_GO

Document created: `docs/ULTRON_PUBLIC_DEMO_FINAL_QA_AND_CONTROLLED_POWER_CLOSEOUT.md`

ULTRON is public-demo ready. Controlled power layers are prepared, but runtime remains `DRY_RUN_ONLY` and real execution remains disabled.

Final safety state:

- Private Mode is not active.
- Chief approval is required before any real local execution.
- High Power Controlled Bridge is prepared but not enabled.
- Secrets, network, external projects and destructive commands remain blocked.
- Backend, auth, APIs, Firebase and Supabase remain inactive.
- Autonomous agents remain blocked.

Next block: Controlled Local Execution MVP, only if the Chief explicitly authorizes it.

---

## Operating Mode

Default mode:

```text
PUBLIC MODE
```

Public mode means Ultron may use only placeholder examples, generic workflows and non-sensitive project scaffolding.

Private mode must not begin until security, storage, access control and data-handling rules are explicitly approved.

---

## Status

Sprint 0 public foundation: complete.

Sprint 1 command center UX hardening: complete.

Sprint 2 Vercel deployment readiness: complete.

Sprint 3 Vercel public demo deployment: complete.

Sprint 4 public operator terminal polish: complete.

Sprint 5 private mode readiness plan: complete.

Sprint 6 manual private memory workflow design: complete.

Sprint 7 agent permissions and human approval model: complete.

Sprint 8 private mode MVP preparation: complete.

Sprint 9 public demo final QA and release closeout: complete.

Sprint 10 public demo presentation pack: complete.

Sprint 11 feedback capture and demo iteration: complete.

Sprint 12 private architecture blueprint: complete.

Sprint 13 local-only private memory prototype: complete.

Sprint 14 approval queue prototype: complete.

Sprint 15 controlled private mode MVP: complete.

Sprint 16 actionable operator MVP: ready for review.

ULTRON Functional MVP: ready for review.

Local Command Bridge: policy-ready, execution disabled.

Operator Runtime Readiness: DRY_RUN_READY, real execution disabled.

High Power Controlled Bridge: prepared, real execution disabled.

Public Demo Final QA: passed, controlled power closed, real execution no-go.

Technical posture: lightweight, local-first, frontend-functional.

Next milestone: Private Mode Execution Gate review.
