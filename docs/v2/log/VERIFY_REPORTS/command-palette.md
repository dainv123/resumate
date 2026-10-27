# VERIFY: command-palette

## Status: PASS-WITH-WARNINGS

Branch: `feat/ui-command-palette`. Spec: `docs/v2/design/SCREEN_SPECS/command-palette.md`.  
Screen delta vs `feat/ui-foundation` (source): `frontend/src/components/command/{CommandPalette,ui-command,command-search}.*` only. No source edits in this pass.

## Forbidden Paths

`git diff main...HEAD --name-only` — **clean** (no `services/`, `store/`, `api/`, `hooks/useQuery*`, `prisma/`, `data/`, or `docs/` outside `docs/v2/`).

Screen build delta (`feat/ui-foundation...HEAD` frontend): **only** `components/command/**` — within TASKS `allowed_paths` (`components/command/**`, `app/layout.tsx` unused).

## Logic Invariant

| Source | Path | Diff in screen delta | Result |
|---|---|---|---|
| `useCvsPaginated` | `frontend/src/hooks/useCvs.ts` | none | unchanged |
| `projectsApi.getUserProjects` + `useQuery(["projects"])` | `frontend/src/lib/projects.ts` | none | unchanged |
| `useTheme` / `setTheme` | `frontend/src/contexts/ThemeContext.tsx` | none | unchanged |
| Nav hrefs | `nav-config.ts` import only | none (file not edited) | unchanged |

Hooks/contracts checked: **4**. Unchanged: **4**. Changed: **none**.

## Type + Lint

- **tsc:** pass (`npm run type-check` — exit 0)
- **eslint:** pass (`npx eslint src/components/command/` — exit 0, no issues)

## DoD

- [x] Cmd/Ctrl+K / topbar open real palette — foundation placeholder "Coming soon" removed; `CommandPalette` uses cmdk (`CommandPalette.tsx` + `ui-command.tsx`); shell still mounts via AppShell
- [x] Navigation: Today / Jobs / CVs / Projects / Settings from `PRIMARY_NAV` + `SECONDARY_NAV`
- [x] Search filters CVs + Projects; Jobs stand-in = tailored CVs → `/dashboard/job-tailor?cvId=`
- [x] Create: New job / New CV / New project navigate to job-tailor / cv / projects
- [x] Theme Light / Dark / System via `applyThemePreference` + `THEME_PREFERENCE_KEY` + `setTheme`; toast labels
- [x] loading / empty / error states present
- [x] responsive: mobile inset `w-[calc(100%-2rem)]` + `sm:w-full` (see Responsive WARN)
- [x] dark mode token classes (`bg-card`, `border-border`, `text-muted-foreground`, destructive banner)
- [x] no file outside allowed_paths in screen delta
- [x] tsc + eslint pass

## States

| State | Finding |
|---|---|
| Loading | **Present** — 4–6 `Skeleton` rows when `cvsLoading \|\| projectsLoading` (idle + searching) |
| Empty | **Present** — `CommandEmpty`: "No results." when searching with zero hits; Create group still shown |
| Error | **Present** — banner "Couldn't load results." + **Retry** (`refetchCvs` / `refetchProjects`) |
| Success | **Present** — filtered groups; select → `router.push` + `onOpenChange(false)` |

## Slop Warnings

None in `components/command/**` (`gradient` / `glow-` / colored glow shadows / welcome copy / `!` strings).

## Responsive

- `sm:` on dialog width and error banner layout (2 rules).
- **WARN:** &lt;3 distinct breakpoint utilities; no `md:` / `lg:` / `xl:` in command module (DoD cites 640/1024/1280 — mobile inset + `sm` covers small screens; larger breakpoints inherit dialog centering only).

## A11y

- Dialog `aria-label="Command palette"`; input `autoFocus`; skeletons `aria-hidden` — **OK**.
- Items are text+icon (not icon-only) — **OK**.
- **WARN:** no local `focus-visible:` / `sr-only` in command module (selection relies on cmdk `data-[selected]`).
- **WARN (process):** no before/after screenshots; no axe scan this pass (`verifier.mdc` extras).

## Recommendation

**APPROVE** — HUMAN GATE 2: review branch `feat/ui-command-palette` (merge onto / after `feat/ui-foundation`), then merge.

Optional follow-ups: add `md:`/`lg:` dialog max-width tweaks; document keyboard smoke in VERIFY screenshots.
