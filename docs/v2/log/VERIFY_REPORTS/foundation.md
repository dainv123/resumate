# VERIFY: foundation

## Status: PASS-WITH-WARNINGS

Branch: `feat/ui-foundation` vs `main`. Spec: `docs/v2/design/SCREEN_SPECS/foundation.md`. No source edits in this pass.

## Forbidden Paths

`git diff main...HEAD --name-only` — **clean**.

No matches under `services/`, `store/`, `api/`, `hooks/useQuery*`, `prisma/`, `data/`, or `docs/` outside `docs/v2/`.

Changed surface (allowed): `frontend/src/app/**` (layout/globals), `frontend/src/components/layout/**`, `frontend/src/components/command/**`, `frontend/src/components/ui/**`, `frontend/tailwind.config.ts`, `frontend/components.json`, `frontend/package.json`(+lock), `docs/v2/**`, `AGENTS.md`, `.cursor/rules/**`.

## Logic Invariant

| Source | Path | Diff vs main | Result |
|---|---|---|---|
| `useAuth` (`user`, `loading`, `logout`) | `frontend/src/contexts/AuthContext.tsx` | none | unchanged |
| `useTheme` (`theme`, `setTheme`, `toggleTheme`) | `frontend/src/contexts/ThemeContext.tsx` | none | unchanged |
| `usePathname` | `next/navigation` | n/a (framework) | unchanged |
| `cn` + helpers | `frontend/src/lib/utils.ts` | none (`cn`, `formatDate`, `formatFileSize`, `truncateText` intact) | unchanged |

Hooks checked: **4**. Unchanged: **4**. Changed: **none**.

Call sites in shell consume contexts only; no new list/detail queries.

## Type + Lint

- **tsc:** pass (`npm run type-check` / `tsc --noEmit` — exit 0)
- **eslint:** pass (exit 0) on changed shell dirs/files  
  - WARN (pre-existing in `src/app/layout.tsx`): unused `schemaFeatures`; Next custom-font warning — not introduced as errors

## DoD

- [x] shadcn installed; `frontend/components.json` present; primitives under `components/ui/` (Button, card, Input, label, dropdown-menu, sheet, dialog, tooltip, separator, avatar, breadcrumb, skeleton, sonner, popover; CommandPalette placeholder under `components/command/`)
- [x] Design tokens in `app/globals.css` (`:root` + `.dark` HSL) + Tailwind/`@theme` extend
- [x] `AppShell` + `Sidebar` + `Topbar` + `QuickAddMenu` render; `app/dashboard/layout.tsx` mounts `AppShell` (legacy `components/dashboard/DashboardLayout` no longer wraps dashboard children)
- [x] Sidebar collapse toggle + `localStorage` key `resumate.sidebar.collapsed` (`nav-config.ts` / `AppShell.tsx`)
- [x] Topbar breadcrumb from route (`Topbar.tsx` — Home > Section [> Item])
- [x] Cmd+K / trigger opens placeholder `CommandPalette`
- [x] Theme menu Light/Dark/System via `applyThemePreference` + `useTheme().setTheme` (preference key `resumate.theme.preference`; resolved theme still via existing ThemeContext)
- [x] Mobile `<1024`: hamburger → `Sheet` with sidebar
- [x] Quick-add New job / New CV / New project stub dialogs
- [x] loading / empty / error per matrix (empty = N/A)
- [x] responsive rules present at sm/md/lg (640/768/1024); see Responsive WARN for missing explicit `xl:`
- [x] dark mode CSS vars + `.dark` class contract
- [x] no forbidden paths touched
- [x] tsc + eslint pass

## States

| State | Finding |
|---|---|
| Loading | **Present** — `Sidebar` renders 3× `Skeleton` when `loading={true}` from `useAuth().loading`; Topbar still mounts (`AppShell.tsx`) |
| Empty | **N/A** (spec) — shell always renders when auth path allows |
| Error | **Present** — `shellError` banner: "Something went wrong." / "The app shell failed to load." / **Retry** (`window.location.reload`) |
| Success | **Present** — children in main; nav + topbar interactive |

## Slop Warnings

None in `components/layout/**`, `components/command/**`, shell Button/sonner.

No `gradient`, `glow-`, `shadow-(red|blue|purple|indigo)`, `Welcome back`, `You're doing great`, or `!` in user-facing string literals scanned.

## Responsive

- `sm:` / `md:` / `lg:` used across `AppShell`, `Topbar`, `Sidebar` (hamburger, sheet vs fixed rail, padding, Cmd+K visibility) — **≥3 rules**.
- **WARN:** no `xl:` utilities in shell; 1280 behavior relies on `max-w-[1200]` + `lg:` only (DoD asks 640/1024/1280).

## A11y

- Icon-only controls with `aria-label`: Open menu, Open command palette (×2), Profile, Collapse/Expand sidebar — **OK**.
- `Button` primitive includes `focus-visible:ring-*` — **OK**.
- Dialog/Sheet close controls include `sr-only` "Close" — **OK**.
- **WARN:** Sidebar `Link` items and Topbar Cmd+K `<button>` lack local `focus-visible:` classes (rely on browser default / not token ring).
- **WARN (process):** no before/after screenshots saved; no axe scan run this pass (listed in `verifier.mdc`, not hard-fail in PROMPT 5 checklist).

## Recommendation

**APPROVE** — HUMAN GATE 2: review branch `feat/ui-foundation`, then merge.

Optional follow-ups (non-blocking): add `xl:` padding/max-width tweak; add `focus-visible:ring` on nav links + Cmd+K trigger; attach screenshot/axe artifacts on next verify iteration.
