# ULTRON Operator Core Blueprint

## Definition

ULTRON Operator Core is the future execution spine for ULTRON: a controlled terminal, repository, model, tool and approval layer that turns the current public operator MVP into a supervised work system.

It is not a backend yet. It is not connected to private data. It is not allowed to execute destructive actions without a Chief-approved gate.

## Target Capabilities

- Read repositories and produce codebase maps.
- Run safe terminal commands with visible logs.
- Route work to the right model or local tool.
- Use MCP as a tool interface layer.
- Track sessions, actions, decisions and approvals.
- Suggest file edits using diffs before writing.
- Execute safe commands under policy.
- Require human approval for critical actions.

## Current Non-Capabilities

- No real private memory.
- No credentials.
- No production backend.
- No autonomous destructive execution.
- No hidden external integrations.
- No direct control over AetherMind, Coco Venture or AetherColony.

## Terminal Connection

The terminal layer should be command-first and permission-first:

1. Parse requested action.
2. Classify action risk.
3. Select command/tool.
4. Show proposed command.
5. Execute only if policy allows.
6. Capture stdout, stderr, exit code and duration.
7. Store a decision/action record.

Read-only commands may run with lower friction. Mutating commands require stronger gates.

## Model Connection

ULTRON should use a model router rather than hard-coding one provider:

- Local/free models first for classification, summarization and routing.
- Paid models for complex reasoning, large code changes and high-value decisions.
- Weak/fast models for routine transforms.
- Strong models for architecture, debugging and risk review.

The router must consider privacy, cost, context size, tool support, reasoning depth and task criticality.

## MCP Connection

MCP is the tool bus. ULTRON should treat each MCP server as a permission-scoped capability provider.

Candidate first tools:

- Filesystem MCP for read-only repo inspection.
- Git MCP for status, diff and log first.
- Time MCP for deterministic scheduling context.
- Fetch MCP only after network policy is approved.
- Memory MCP only for mock or local-only memory until private mode is approved.

## Tool Decision Flow

ULTRON should select tools using this sequence:

1. Can the task be answered from current context?
2. If not, is read-only repository inspection enough?
3. If not, is a safe terminal command required?
4. If mutation is requested, is it scoped and reversible?
5. If external access is requested, is it approved?
6. If critical, request Chief approval.

## Action Logging

Every operator action should produce an action record:

- action_id
- timestamp
- project
- requested_goal
- selected_tool
- permission_level
- command_or_operation
- result_summary
- approval_state
- rollback_hint

## Human Approval

Human approval is mandatory for:

- install commands
- file deletion
- git commit or push
- credential movement
- private memory writes
- external API access
- autonomous multi-step execution
- changes to protected projects

## Absorbed Source Patterns

- Claurst: tool interface, permissions, ACP, MCP, sessions, provider abstraction.
- OpenHands: sandbox boundary, runtime config, agent capability toggles.
- Aider: repo map, Git-aware diffs, test/lint feedback loop.
- LiteLLM: provider router, cost/rate hooks, fallback strategy.
- MCP servers: external tools as declared, inspectable, permission-scoped servers.

## Operator Core Principle

ULTRON can become more autonomous only when every action is classified, logged, reversible where possible and blocked by default when risk is unclear.
