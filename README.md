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

Sprint 15 controlled private mode MVP: ready for commit.

Technical posture: lightweight, local-first, documentation-first.

Next milestone: public demo v1 final seal.
