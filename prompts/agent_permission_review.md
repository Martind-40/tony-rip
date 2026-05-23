# Agent Permission Review Prompt

Use this prompt before proposing or creating any new ULTRON agent.

## Required Input

- Proposed agent name.
- Purpose.
- Intended users.
- Input sources.
- Output types.
- Requested permission level.
- Required tools, if any.
- Data sensitivity.
- Whether credentials are involved.
- Whether external systems are involved.
- Whether actions are manual, human-approved or autonomous.

## Risk Matrix

| Risk Area | Low | Medium | High | Critical |
|---|---|---|---|---|
| Data sensitivity | Public-safe only | Internal placeholder | Private work context | Personal data, credentials or customer data |
| Tool access | None | Local draft only | External tool proposal | Live external action |
| Action type | Suggest | Draft | Human-approved action | Autonomous action |
| Persistence | No storage | Template only | Private memory proposal | Unapproved memory write |
| Transfer | None | Public-safe routing | Cross-project proposal | Unapproved private transfer |

## Security Checks

Answer each check with `PASS`, `NEEDS_REVIEW` or `BLOCKED`.

| Check | Status | Notes |
|---|---|---|
| Purpose is narrow and named |  |  |
| Inputs are public-safe or approved |  |  |
| Outputs are reviewable |  |  |
| No credentials required |  |  |
| No personal data required |  |  |
| No autonomous action requested |  |  |
| No external tool connection active |  |  |
| Human approval path is defined |  |  |
| Logging or review record is defined |  |  |
| Maximum permission level is defined |  |  |

## Decision Rules

- If the agent requires credentials, decision is `BLOCKED`.
- If the agent processes personal data without approval, decision is `BLOCKED`.
- If the agent can act autonomously, decision is `BLOCKED`.
- If the agent connects to external systems, decision is `NEEDS_REVIEW` or `BLOCKED`.
- If approval, input or output boundaries are unclear, decision is `NEEDS_REVIEW`.
- If the agent is only a design artifact with public-safe inputs, decision may be `APPROVED_FOR_DESIGN_ONLY`.

## Final Decision

Use exactly one:

- `APPROVED_FOR_DESIGN_ONLY`
- `NEEDS_REVIEW`
- `BLOCKED`

## Autonomy Rule

No ULTRON agent may receive autonomous execution permission without explicit human approval, security review, logging requirements and a separate implementation phase.
