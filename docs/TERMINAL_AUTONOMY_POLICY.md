# Terminal Autonomy Policy

## Purpose

This policy defines how ULTRON may classify terminal and repository actions before future execution capability exists.

Default decision: BLOCKED when risk is unclear.

## Permission Levels

| Level | Meaning | Execution Rule |
|---|---|---|
| READ_ONLY | Reads state without mutation | Allowed in approved workspace |
| SUGGEST_ONLY | Produces command or patch but does not run/apply | Allowed |
| SAFE_EXECUTE | Low-risk command with bounded effect | Allowed after visible logging |
| APPROVAL_REQUIRED | Mutates files, dependencies, git or environment | Requires Chief/operator approval |
| BLOCKED | Dangerous, private, credential or destructive action | Denied |

## Action Classification

| Action | Level | Notes |
|---|---|---|
| pwd | READ_ONLY | Safe in approved workspace |
| ls/find/rg | READ_ONLY | Must stay inside approved roots |
| cat/sed/head/tail | READ_ONLY | Do not read private paths |
| git status | READ_ONLY | Safe |
| git log | READ_ONLY | Safe |
| git diff | READ_ONLY | Safe |
| npm run build | SAFE_EXECUTE | Allowed if project scripts are known |
| npm test | SAFE_EXECUTE | Allowed if scripts are known |
| lint/format check | SAFE_EXECUTE | Allowed if non-mutating |
| install packages | APPROVAL_REQUIRED | Dependency and network risk |
| modify files | APPROVAL_REQUIRED | Must read before write and show diff |
| git add | APPROVAL_REQUIRED | Staging changes changes release state |
| git commit | APPROVAL_REQUIRED | Requires reviewed scope |
| git push | APPROVAL_REQUIRED | Requires explicit Chief approval |
| delete files | BLOCKED | Unless exact file and reason approved |
| rm -rf | BLOCKED | Default deny |
| move credentials | BLOCKED | Never automate |
| read .env or secrets | BLOCKED | Unless explicit secure review |
| write private memory | APPROVAL_REQUIRED | Future private mode only |
| touch AetherMind/Coco/AetherColony | BLOCKED | Unless explicitly scoped |
| external API calls | APPROVAL_REQUIRED | Credentials/network risk |
| autonomous multi-step execution | APPROVAL_REQUIRED | Needs plan, limits and stop rule |

## Read Before Write

Any write must prove:

- target file was read in the current session
- target path is in approved workspace
- change is scoped
- diff is reviewable
- rollback path exists

## Safe Execute Requirements

SAFE_EXECUTE commands must:

- run in an approved working directory
- avoid secrets
- avoid network unless explicitly expected
- have timeout
- log command, output summary and exit code
- stop on failure

## Approval Required Requirements

Before running APPROVAL_REQUIRED actions, ULTRON must show:

- requested objective
- exact command or files
- expected effect
- risk level
- rollback hint
- approval prompt

## Blocked Conditions

Block immediately when:

- command targets credentials, private memory or unknown hidden folders
- path is outside approved workspace
- action is destructive and broad
- model suggests bypassing permissions
- command includes unknown remote installer
- command pushes or publishes without approval

## Future Implementation

The first implementation should be a policy evaluator that classifies a proposed command. Execution can come later.
