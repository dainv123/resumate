# Decision Log

## 2026-01-01 — Use shadcn/ui + Tailwind as UI foundation
Decision: All new UI uses shadcn/ui + Tailwind utilities.
Why: Consistency, a11y defaults, no custom design system to maintain.
Alternatives considered: MUI (heavier), Mantine (less composable), keep custom (rejected).

## 2026-01-01 — All agent docs live under docs/v2/
Decision: Every audit/design/plan/log artifact is under docs/v2/.
Why: Isolates this redesign from legacy docs/, enables clean comparison and eventual archival.
Alternatives considered: docs/ (pollutes legacy), .agents/ (non-standard, hidden from review).

## 2026-10-28 — shadcn peer packages allowed for foundation
Decision: Install shadcn/ui peer deps as needed for listed primitives: `class-variance-authority`, `@radix-ui/react-slot`, `@radix-ui/react-dialog`, `@radix-ui/react-dropdown-menu`, `@radix-ui/react-separator`, `@radix-ui/react-tooltip`, `@radix-ui/react-avatar`, `@radix-ui/react-popover`, `@radix-ui/react-label`, `sonner`, `cmdk`.
Why: Prior decision chose shadcn/ui; peers are required to implement foundation DoD. No other UI libraries.
Alternatives considered: hand-roll without Radix (worse a11y), full redesign kit (rejected).

## 2026-10-28 — Foundation paths map to frontend/src + dashboard layout
Decision: TASKS paths are relative to `frontend/src/` (and `frontend/` for tailwind/components.json). Until `app/(app)` route group exists, AppShell mounts at `app/dashboard/layout.tsx`. Foundation allowed_paths also include `components/command/**` (placeholder CommandPalette per SCREEN_SPEC) and `app/dashboard/layout.tsx`.
Why: Spec requires CommandPalette + shell wire-in; idealized `(app)` paths are not live yet.
Alternatives considered: leave shell unmounted (fails DoD), migrate all routes to `(app)` in foundation (out of scope).
