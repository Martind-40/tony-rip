# Model Router Strategy

## Strategy

ULTRON should be open-source and local/free first. Paid models are strategic amplifiers for tasks where quality, context length, reasoning depth or delivery speed justify the cost.

The router is not active yet. This document defines the decision policy.

## Provider Priority

1. Local models for safe generic tasks.
2. Free/open providers for draft, classification and summarization.
3. Paid low-cost models for routine coding and UI/content improvements.
4. Paid high-capability models for complex architecture, debugging, security review and final synthesis.
5. Human review for critical decisions regardless of model used.

## Candidate Providers

| Provider | Role | Use When | Blocked Until |
|---|---|---|---|
| Ollama/local | Private-first local reasoning | Classification, summaries, draft routing, offline tasks | Local model policy approved |
| Qwen local | Coding and structured reasoning | Repo analysis, code explanations, task breakdown | Local runtime benchmarked |
| Gemma local | Lightweight local tasks | Short summaries and safe demo processing | Local runtime benchmarked |
| OpenAI | High quality reasoning/coding | Complex implementation, review, architecture | API key policy approved |
| Anthropic/Claude | Long-context reasoning | Large repo synthesis, agent planning, safety review | API key policy approved |
| Gemini | Long-context and multimodal future | Large docs, visual inputs, cheap broad context | API key policy approved |
| LiteLLM | Router/gateway pattern | Provider abstraction and fallback | Backend/proxy approval |

## Routing Criteria

| Criterion | Preferred Route |
|---|---|
| Sensitive or private content | Local-only or blocked |
| Public generic task | Local/free model first |
| Simple classification | Local small model |
| Codebase map | Local model plus repo scanner, escalate if unclear |
| Complex debugging | Strong paid model after approval |
| High-stakes decision | Strong model plus human review |
| Expensive long context | Summarize locally, escalate only distilled context |
| Tool execution request | Policy engine before model choice |

## Cost Policy

- Default to no-cost execution.
- Estimate task value before paid calls.
- Use paid models only when the expected value exceeds cost.
- Track provider, model, reason and estimated spend in action logs.
- Never let a model decide spend without policy constraints.

## Privacy Policy

- Private or company data never goes to paid models by default.
- Raw sensitive data is blocked.
- Distilled pure knowledge may be routed only after approval.
- Local models are preferred for private-mode prototypes.

## Quality Policy

Use stronger models for:

- architecture decisions
- security reviews
- cross-repo synthesis
- hard bugs
- final release checks

Use weaker/local models for:

- first-pass summaries
- tagging
- task triage
- safe demo text
- non-critical transformations

## Router Decision Output

Every routing decision should produce:

- selected_model
- provider
- reason
- expected_cost_band
- privacy_level
- fallback_model
- human_approval_required

## Not Active Yet

No API calls, LiteLLM proxy, credentials or paid model routing are active in ULTRON. This is the strategy for a future gated implementation.
