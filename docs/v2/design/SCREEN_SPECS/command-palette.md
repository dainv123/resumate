# Screen Spec: command-palette

## Goal
Within 30 seconds a signed-in user opens Cmd+K (or the topbar search control), types to jump to a job/CV/project or a nav section, runs New job/CV/project, or switches theme — then lands without leaving the keyboard.

## shadcn components used
- command (cmdk via shadcn `Command`)
- dialog (CommandDialog pattern)
- button
- separator
- skeleton
- sonner (toast on theme change / navigation smoke optional)

## Layout tree (ASCII)
```
[ Overlay ]
+----------------------------------------------------------+
|  CommandDialog (centered, max-w ~640, radius-lg)         |
|  +------------------------------------------------------+|
|  | [🔍] Search jobs, CVs, projects…                 ⌘K ||
|  +------------------------------------------------------+|
|  | Suggestions (when query empty)                       ||
|  |   Navigation                                         ||
|  |     Today / Jobs / CVs / Projects / Settings         ||
|  |   Create                                             ||
|  |     New job / New CV / New project                   ||
|  |   Theme                                              ||
|  |     Light / Dark / System                            ||
|  |------------------------------------------------------|
|  | Results (when query non-empty)                       ||
|  |   Jobs        ← stand-in: tailored CVs → job-tailor  ||
|  |   CVs         ← useCvsPaginated matches              ||
|  |   Projects    ← getUserProjects matches              ||
|  |   (or empty: "No results" + keep Create group)       ||
|  +------------------------------------------------------+|
+----------------------------------------------------------+

Open via: Cmd/Ctrl+K (AppShell) · topbar "Search or jump to…" control.
Close: Esc · click outside · selecting an item (then navigate).
```

## Component tree
```
components/command/CommandPalette.tsx          ← replace foundation placeholder; keep props { open, onOpenChange }
├── components/ui/command.tsx                  ← add shadcn Command* if missing (allowed under components/ui only if TASKS paths extended; prefer implement Command primitives inside components/command/ui-command.tsx to stay in allowed_paths)
├── components/command/CommandPaletteGroups.tsx  ← optional split: Navigation / Create / Theme / Results
└── components/command/command-search.ts         ← pure filter helpers (no API)

Wire-in (already exists — do not re-own unless required):
- components/layout/AppShell.tsx → open state + Cmd+K listener + <CommandPalette />
- components/layout/Topbar.tsx → trigger calls onOpenCommandPalette

If Builder cannot edit AppShell/Topbar (TASKS allowed_paths), keep existing `{ open, onOpenChange }` contract and only replace CommandPalette body.
```

**Path note for Gate 1b:** TASKS currently allows `[components/command/**, app/layout.tsx]`. Prefer zero shell edits. If `components/ui/command.tsx` is required, Orchestrator must add `components/ui/**` to allowed_paths (or colocate cmdk wrapper under `components/command/`).

## Data sources (READ-ONLY contract)
Builder must NOT change these APIs/shapes — consume only:

| Source | Path | Used for |
|---|---|---|
| `useCvsPaginated({ limit: 50, sortBy: "updatedAt", sortOrder: "DESC" })` | `frontend/src/hooks/useCvs.ts` → `cvApi.getUserCvsPaginated` | Jump-to-CV results; job stand-in rows where `cv.isTailored` → `/dashboard/job-tailor?cvId=<id>` |
| `useQuery({ queryKey: ["projects"], queryFn: projectsApi.getUserProjects })` | `@tanstack/react-query` + `frontend/src/lib/projects.ts` | Jump-to-project → `/dashboard/projects` (no project detail route; select navigates to projects list; optional hash/query deferred) |
| `useTheme()` → `theme`, `setTheme` | `frontend/src/contexts/ThemeContext.tsx` | Theme actions Light/Dark (System: resolve via `matchMedia` + `setTheme`, same preference key pattern as foundation `resumate.theme.preference` if already used in shell — do not change ThemeContext types) |
| `useRouter()` / `usePathname()` | `next/navigation` | Navigate on select; optional highlight current section |
| Nav href constants | reuse labels/hrefs from `frontend/src/components/layout/nav-config.ts` (import only; do not edit that file unless path allowed) | Today `/dashboard`, Jobs `/dashboard/job-tailor`, CVs `/dashboard/cv`, Projects `/dashboard/projects`, Settings `/dashboard/settings` |

**Do not:** invent a Jobs API, change `useCvs*` / `projectsApi` signatures, or call mutations from the palette (create = navigate only).

**Jobs gap (audit):** no `/jobs` entity list. "Jump to job" = (1) nav item Jobs, and/or (2) tailored CV rows labeled as job applications linking to job-tailor with `cvId`.

## State matrix
| State | Component behavior |
|---|---|
| Loading | Dialog open; search input visible; results area shows 4–6 row Skeletons while CV/projects queries `isLoading`. Navigation/Create/Theme groups still usable immediately. |
| Empty | Query string non-empty and no matches: centered body-sm "No results." + keep Create group visible (New job / New CV / New project). Query empty: show Suggestions only (not an empty-error). |
| Error | If CV or projects query `isError`: inline banner under input — "Couldn't load results." + button "Retry" calling `refetch`. No `alert()`. Navigation/Create/Theme still work. |
| Success | Filtered groups render; Enter/click navigates and closes palette (`onOpenChange(false)`). |

## Copy text
Exact strings (en):

**Chrome**
- Input placeholder: Search jobs, CVs, projects…
- Dialog aria-label: Command palette

**Group: Navigation**
- Heading: Navigation
- Today
- Jobs
- CVs
- Projects
- Settings

**Group: Create**
- Heading: Create
- New job
- New CV
- New project

**Group: Theme**
- Heading: Theme
- Light
- Dark
- System

**Group: Jobs** (results)
- Heading: Jobs
- Item label pattern: `{originalFileName}` · Tailored
- Empty subsection: (use global No results)

**Group: CVs** (results)
- Heading: CVs
- Item label: `{originalFileName}` (optional caption: Version {version})

**Group: Projects** (results)
- Heading: Projects
- Item label: `{name}` (optional caption: `{role}`)

**Empty / error**
- No results.
- Couldn't load results.
- Retry

**Toasts (optional)**
- Theme: Light
- Theme: Dark
- Theme: System

## UX rules to enforce
- Only ONE primary focus when open: the search input (autofocus). No competing primary button in the dialog chrome.
- Keyboard-first: ↑/↓ move, Enter select, Esc close; Cmd/Ctrl+K toggles open when shell already wired.
- Max height ~60vh with scroll inside list; input sticky at top.
- Do not show 4 equal KPI cards, charts, or marketing copy inside the palette.
- Create actions navigate only (same destinations as Quick-add stubs): Jobs → `/dashboard/job-tailor`, CVs → `/dashboard/cv`, Projects → `/dashboard/projects`. Do not open multi-field modals here.
- Theme actions call existing `setTheme` contract; System uses preference + media query without extending ThemeContext types.
- Filter client-side on already-fetched lists; debounce optional ≤150ms; no new search endpoints.
- Dark mode: use token surfaces (`bg-popover` / `bg-card`, `border-border`, muted captions).
- Copy tone: direct, no exclamation, no emoji.

## DoD
- [ ] Cmd/Ctrl+K and topbar trigger open the real Command palette (not foundation "Coming soon" dialog)
- [ ] Navigation group jumps to Today / Jobs / CVs / Projects / Settings
- [ ] Search filters CVs and Projects; Jobs stand-in (tailored CVs) links to job-tailor with `cvId`
- [ ] Create: New job / New CV / New project navigate correctly
- [ ] Theme: Light / Dark / System works and persists via existing theme contract
- [ ] loading / empty / error states present (per matrix)
- [ ] responsive at 640 / 1024 / 1280 (dialog usable full-width on mobile with 16px inset)
- [ ] dark mode
- [ ] no file outside allowed_paths touched (extend TASKS if `components/ui/command.tsx` needed)
- [ ] tsc + eslint pass
