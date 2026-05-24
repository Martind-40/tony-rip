# ULTRON v1.5 — Vercel Secure Environment + Mobile Live Claude Test

## Status

LOCAL_BUILD_AND_HEALTH_PASS / READY_FOR_VERCEL_SECURE_ENVIRONMENT_CONFIGURATION

## Scope

- Added `AI_PROVIDER` support in the backend.
- Added OpenAI provider path using `gpt-4o-mini`.
- Preserved Claude provider path using `claude-sonnet-4-5`.
- Updated mobile header state contract to show `OPENAI READY`, `CLAUDE READY`, or `WAITING_FOR_KEY`.
- Updated runtime config and v1.5 snapshot.

## Vercel Dashboard Required

Configure these variables in Vercel Dashboard only:

```text
AI_PROVIDER=openai
OPENAI_API_KEY=<real key in Vercel only>
ANTHROPIC_API_KEY=
ULTRON_TOKEN=ULTRON_LOCAL_OPERATOR_TOKEN
```

Do not commit keys. Do not add `.env` files to the repository.

## Validation Results

- Base status: ULTRON v1.4 closed, backend online, local Anthropic key invalid.
- Build: PASS, `npm run build`.
- Local backend health: PASS, `/api/health` returned `version: v1.5`, `aiProvider: openai`, `aiProxy: READY_WITH_KEY`.
- Vercel environment: pending Chief Dashboard configuration.
- Mobile live chat: pending deployed environment with valid provider key.
- Secret safety: no secrets added to code or docs.

## Guardrails

- No shell real from UI.
- No autonomous agents.
- No `.env` access from UI.
- No git push.
- Provider network access remains controlled to `/api/chat`.

## Final State

v1.5 is ready for secure Vercel environment configuration. Local build and health pass. Live mobile validation remains pending until Chief configures provider env vars in Vercel and redeploys.
