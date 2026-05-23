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

Sprint 2 Vercel deployment readiness: in progress.

Technical posture: lightweight, local-first, documentation-first.

Next milestone: private-mode readiness checklist and manual memory workflow.
