# Resumate UI Redesign — Agent Memory

## Mission
Migrate Resumate UI to shadcn/ui + Tailwind following a signed-off blueprint.
NEVER change: business logic, API calls, state management, data contracts, route params.

## Roles
- Orchestrator: dispatch tasks, update docs/v2/plan/TASKS.md, enforce DoD
- Auditor: produce docs/v2/audit/*
- Designer: produce docs/v2/design/*
- Builder: implement UI per spec, run tsc + eslint
- Verifier: validate DoD, screenshot diff, a11y, forbidden-path check

## Hard Rules
- Read docs/v2/plan/TASKS.md + docs/v2/log/DECISIONS.md before any edit.
- Builder edits ONLY files in task.allowed_paths.
- NEVER touch: services/, store/, api/, hooks/useQuery*, prisma/, data/, lib/api*.
- NEVER add npm packages without a docs/v2/log/DECISIONS.md entry.
- NEVER change API request/response shape or state shape.
- Max 3 Builder→Verifier iterations per screen, then escalate.
- Every screen ships on branch feat/ui-<screen-id>.
- No autonomous merge. Human approves every PR.

## Source of Truth
- docs/v2/audit/ROUTE_MAP.md
- docs/v2/audit/COMPONENT_INVENTORY.md
- docs/v2/audit/UI_AUDIT.md
- docs/v2/audit/STATE_MATRIX.md
- docs/v2/design/DESIGN_TOKENS.md
- docs/v2/design/BLUEPRINT.md
- docs/v2/design/SCREEN_SPECS/<screen-id>.md
- docs/v2/plan/TASKS.md
- docs/v2/plan/MIGRATION_PLAN.md
- docs/v2/log/DECISIONS.md
