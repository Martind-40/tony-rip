# Open Source Absorption Map

## Purpose

This document converts the five external open-source repositories into ULTRON architecture inputs. It does not import code. It extracts patterns, boundaries and design choices.

| Source | What To Use | What To Avoid | What To Adapt | Main Risk | Value For ULTRON |
|---|---|---|---|---|---|
| Claurst | Terminal agent UX, tool interface, permission modes, MCP, ACP, multi-provider sessions | Permission bypass modes, unreviewed remote installers, credential storage | Tool schema, read-before-write, session logs, provider abstraction | Beta maturity and GPL license constraints if copying code | Primary reference for Terminal Operator Core |
| OpenHands | Sandbox architecture, runtime config, agent toggles, file store concepts, event services | Running Docker/services now, enterprise/cloud assumptions, broad integrations | Local sandbox policy, max iterations, budget caps, action/event records | High complexity and service sprawl | Reference for controlled autonomy and sandbox design |
| Aider | Repo map, Git-aware workflow, diff-first edits, lint/test loop, pair programming terminal | Auto-commit defaults, direct model keys in CLI, broad repo mutation | Reviewable patches, repo context builder, safe commit proposal flow | Accidental writes/commits if used directly | Practical coding operator patterns |
| LiteLLM | Model router, unified provider format, fallback/load balancing, cost tracking, guardrails | Proxy backend activation now, virtual keys, DB/Redis dependencies | Router strategy as design layer first, local/free priority, paid escalation | Provider credentials and spend risk | Core model routing strategy |
| MCP servers | Tool bus, filesystem roots, Git server, tool annotations, reference servers | Production trust without review, write tools by default, remote APIs | Project-scoped MCP allowlists and tool risk metadata | Tool injection and silent execution | Future tool integration layer |

## Claurst Absorption

Use:

- Common tool interface with name, schema, flags, permission check and execution.
- Permission modes: plan/read-only, default prompt, auto for safe tools only.
- Read-before-write enforcement.
- MCP servers as native tools.
- ACP as future editor/terminal protocol option.
- Session history and command UI as inspiration.

Avoid:

- Any bypass-permissions mode in ULTRON default.
- Copying GPL implementation code.
- Storing real credentials in project files.

## OpenHands Absorption

Use:

- Sandbox as a required boundary before real execution.
- Config-based feature toggles for browser, command, editor, Jupyter and finish tools.
- Max iteration and budget controls.
- Event and trajectory concepts for replay and audit.

Avoid:

- Docker runtime activation in the current public repo.
- Backend/API service creation before Chief approval.
- Enterprise auth assumptions.

## Aider Absorption

Use:

- Repo-aware context map before editing.
- Diff-first review.
- Git status/diff/log as first-class actions.
- Test/lint feedback loop after modifications.
- Explicit commit message generation only after review.

Avoid:

- Auto-commit behavior.
- Unscoped repo mutation.
- Direct model configuration with real keys.

## LiteLLM Absorption

Use:

- Router abstraction over providers.
- Fallback logic.
- Cost and budget metadata.
- Guardrail hooks.
- Provider-normalized request format.

Avoid:

- Running proxy server now.
- Redis/Postgres dependencies now.
- Virtual key management in public demo mode.

## MCP Servers Absorption

Use:

- Filesystem roots as access boundaries.
- Git MCP for status/diff/log before mutations.
- Tool annotations: read-only, idempotent, destructive.
- Server allowlists per project.

Avoid:

- Write-capable filesystem tools before approval.
- Remote API servers without credential policy.
- Memory server with private content before Private Mode.

## Decision

ULTRON should absorb architecture, not code. The first Operator Core implementation should be a small local policy and tool registry before any real MCP or backend execution.
