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
npm run build
```

The Vercel configuration builds from `/app`:

```json
{
  "buildCommand": "cd app && npm install && npm run build",
  "outputDirectory": "app/dist",
  "framework": "vite"
}
```

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

Sprint 1 command center UX hardening: in progress.

Technical posture: lightweight, local-first, documentation-first.

Next milestone: private-mode readiness checklist and manual memory workflow.
