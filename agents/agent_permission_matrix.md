# Agent Permission Matrix

Mode: PUBLIC DEMO MODE
Private Mode: NOT_READY
Autonomous agents: BLOCKED

All agents in this matrix are conceptual. No functional autonomous agents are active.

| Agent Type | Current Status | Allowed Capability | Blocked Capability | Approval Required | Notes |
|---|---|---|---|---|---|
| Command Center Agent | DESIGN_ONLY | Summarize public-safe command status and suggest next steps. | Execute commands, change systems or connect tools. | Required for any action beyond draft text. | Operator dashboard role only. |
| Memory Assistant | DESIGN_ONLY | Draft memory templates and classify public-safe examples. | Store real private memory or process personal data. | Required for any private memory write. | Private memory remains design-only. |
| Knowledge Distiller | PROPOSAL_ONLY | Convert approved public-safe notes into reusable summaries. | Distill unapproved private documents. | Required for non-public sources. | Must preserve source boundaries. |
| Project Router | PROPOSAL_ONLY | Suggest routing labels and project destinations. | Transfer private knowledge to another project. | Required for any cross-project transfer. | Default transfer status is blocked. |
| Agent Factory | PROPOSAL_ONLY | Propose agent specs, limits and permission levels. | Create live agents or grant tool access. | Required for any implementation. | Design artifact only. |
| Security Reviewer | DESIGN_ONLY | Review policies, risks and approval gates. | Override human approval or approve itself. | Required for policy changes. | Advisory role only. |
| Future Screen Operator | DESIGN_ONLY | Describe future screen operation rules. | Capture screens, click UI or perform actions. | Required before any prototype. | Must remain inactive in Public Demo Mode. |
| Future Voice Operator | DESIGN_ONLY | Describe future voice interaction boundaries. | Record audio, identify speakers or issue commands. | Required before any prototype. | Must remain inactive in Public Demo Mode. |

## Default Rule

If an agent capability is not explicitly approved, it is blocked.
