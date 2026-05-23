# Operator Core Next Actions

## Status

OPEN_SOURCE_ABSORPTION_COMPLETE_FOR_DESIGN

ULTRON remains PUBLIC DEMO MODE. No backend, auth, APIs, credentials, private data, autonomous agents or external execution were activated.

## Files Created

- `docs/ULTRON_OPERATOR_CORE_BLUEPRINT.md`
- `docs/OPEN_SOURCE_ABSORPTION_MAP.md`
- `docs/MODEL_ROUTER_STRATEGY.md`
- `docs/TERMINAL_AUTONOMY_POLICY.md`
- `docs/MCP_TOOLING_STRATEGY.md`
- `docs/OPERATOR_CORE_NEXT_ACTIONS.md`

## Immediate Actions

1. Review and approve Operator Core boundaries.
2. Decide whether ULTRON can add local config files for:
   - command policy
   - model router policy
   - MCP tool registry
   - action log schema
3. Keep runtime execution disabled until policy evaluator exists.
4. Keep all repos in lab as references only.
5. Avoid UI polish until Operator Core direction is approved.

## Implementation Candidates After Approval

| Candidate | Description | Risk |
|---|---|---|
| `core/operator_core.policy.json` | Static action classification policy | Low |
| `core/model_router.policy.json` | Local/free-first model routing config | Low |
| `core/mcp_tool_registry.json` | Candidate MCP tools and risk metadata | Medium |
| `memory/operator_action_log_TEMPLATE.md` | Manual action log template | Low |
| UI status card | Show Operator Core as DESIGN_READY | Low |

## Risks

- Claurst is GPL; do not copy implementation code into ULTRON.
- OpenHands is powerful but heavy; do not run Docker/backend yet.
- Aider can mutate repos and commit; keep direct use out of protected repos until approved.
- LiteLLM proxy requires credentials/backend concerns; do not activate yet.
- MCP servers can expose dangerous tools; use read-only roots first.

## Pending Chief Decisions

- Approve Operator Core as the next build direction.
- Decide whether to implement policy JSON files now.
- Decide whether terminal command classification can be added to the frontend.
- Decide whether any MCP server can be tested in a disposable repo.
- Decide whether local model routing should be tested with Ollama/Qwen/Gemma.

## What Can Be Implemented Next

One compact Operator Core base:

- command classifier
- tool registry
- model router policy
- action log template
- mock terminal proposal UI

This should still avoid real execution until the policy evaluator is reviewed.

## Stop Rule

Do not connect live tools, credentials, private memory, external APIs, backend services or protected repos until the Chief explicitly approves the next action.
