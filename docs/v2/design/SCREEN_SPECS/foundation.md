# Screen Spec: foundation

## Goal
Within 30 seconds a signed-in user must see the new App Shell (sidebar + topbar), navigate to Today/Jobs/CVs/Projects/Settings, open Cmd+K, Quick-add, and toggle theme — with no content-screen redesign yet.

## shadcn components used
- button
- card
- input
- label
- dropdown-menu
- sheet
- dialog
- tooltip
- separator
- avatar
- breadcrumb
- skeleton
- sonner (toast)
- command (placeholder palette only)
- popover

## Layout tree (ASCII)
```
Desktop (>=1024)
+------------------------------------------------------------------+
| Topbar 56px                                                       |
| [≡?] Breadcrumb          [ Search or jump to… ]   [+ New] [Avatar]|
+----------+-------------------------------------------------------+
| Sidebar  | Main (max-w 1200, pad 32)                              |
| 240/64   | [optional shell error banner]                          |
| Today    | {children}  ← legacy page content unchanged this task  |
| Jobs     |                                                        |
| CVs      |                                                        |
| Projects |                                                        |
| ───────  |                                                        |
| Settings |                                                        |
+----------+-------------------------------------------------------+

Mobile (<1024)
+------------------------------------------------------------------+
| Topbar: [Hamburger] crumb …  [Cmd+K compact] [+ New] [Avatar]     |
+------------------------------------------------------------------+
| Main (pad 16) {children}                                          |
+------------------------------------------------------------------+
| Sheet ← hamburger: same Sidebar nav                               |
+------------------------------------------------------------------+
```

## Component tree
```
components/layout/AppShell.tsx
├── components/layout/Topbar.tsx
│   ├── Breadcrumb (route-derived)
│   ├── Button/Input-styled Cmd+K trigger → components/command/CommandPalette.tsx (placeholder)
│   ├── components/layout/QuickAddMenu.tsx
│   │   └── DropdownMenu → Dialog stubs: New job | New CV | New project
│   └── Avatar → DropdownMenu (Settings / Theme / Sign out)
├── components/layout/Sidebar.tsx
│   ├── Nav links: Today, Jobs, CVs, Projects
│   ├── Separator
│   ├── Settings
│   └── Collapse toggle (desktop)
└── Sheet (mobile drawer wrapping Sidebar)

components/ui/*          ← shadcn primitives installed here
lib/utils.ts             ← keep existing cn(); do not remove formatDate/formatFileSize/truncateText
app/globals.css          ← CSS vars light + dark from DESIGN_TOKENS.md
tailwind.config.*        ← extend colors/radius/font to tokens
```

**Wire-in (allowed layout entry):** replace shell used by dashboard layout so children render inside AppShell. Prefer updating the dashboard layout entry that currently mounts the legacy shell (`frontend/src/app/dashboard/layout.tsx` today; TASKS also lists `app/(app)/layout.tsx` if that route group is introduced). Do not rewrite page content.

## Data sources (READ-ONLY contract)
Builder must NOT change these APIs/shapes — consume only:

| Source | Path | Used for |
|---|---|---|
| `useAuth()` → `user`, `loading`, `logout` | `frontend/src/contexts/AuthContext.tsx` | Auth gate (same behavior as legacy shell), avatar initials/name, Sign out |
| `useTheme()` → `theme`, `setTheme` / `toggleTheme` | `frontend/src/contexts/ThemeContext.tsx` | Theme menu (extend UI to light/dark/system without changing persistence key contract beyond existing `localStorage.theme` + `document.documentElement.classList`) |
| `usePathname()` | `next/navigation` | Active nav + breadcrumb segments |
| `cn` | `frontend/src/lib/utils.ts` | Class merging (already exists) |

**Do not call** new list/detail queries in foundation. Jobs badge count: omit or show static empty until `jobs-list` provides a read-only hook — do not invent endpoints.

Legacy reference only (replace UI, keep auth redirect behavior):
- `frontend/src/components/dashboard/DashboardLayout.tsx`
- `frontend/src/components/dashboard/Sidebar.tsx`
- `frontend/src/components/dashboard/MobileHeader.tsx`

## State matrix
| State | Component behavior |
|---|---|
| Loading | Topbar renders immediately (crumb + Cmd+K + New + avatar placeholder). Sidebar shows 3 nav-item Skeletons (icon + label bars). Main does not block on full-page spinner. |
| Empty | N/A — shell always renders when authenticated. |
| Error | If shell-critical client failure (e.g. theme provider missing): inline banner at top of main — title "Something went wrong.", body "The app shell failed to load.", button "Retry" (reload). No `alert()`. Auth unauthenticated continues redirect to `/auth/login` as today. |
| Success | Sidebar + Topbar interactive; `{children}` render in main. |

## Copy text
Exact strings (en):

**Sidebar**
- Today
- Jobs
- CVs
- Projects
- Settings
- Collapse sidebar (tooltip)
- Expand sidebar (tooltip)

**Topbar**
- Breadcrumb root: Home
- Cmd+K trigger placeholder: Search or jump to…
- Cmd+K aria-label: Open command palette
- Quick-add trigger: New
- Quick-add items: New job · New CV · New project
- Profile menu: Settings · Theme · Light · Dark · System · Sign out
- Hamburger aria-label: Open menu

**CommandPalette placeholder**
- Title: Command palette
- Body: Coming soon. Jump to jobs, CVs, and projects will ship next.
- Close: Close

**Quick-add Dialog stubs** (until feature screens own them)
- New job — title: Add job · body: Job creation opens in the Jobs screen next. · primary: Go to Jobs · secondary: Cancel
- New CV — title: Add CV · body: CV creation opens in the CVs screen next. · primary: Go to CVs · secondary: Cancel
- New project — title: Add project · body: Project creation opens in the Projects screen next. · primary: Go to Projects · secondary: Cancel

**Shell error banner**
- Title: Something went wrong.
- Body: The app shell failed to load.
- CTA: Retry

**Toast** (optional smoke)
- Signed out

## UX rules to enforce
- Only ONE primary action visible above fold in the topbar chrome: **New** (Quick-add). Cmd+K is secondary (muted input style). Avatar is tertiary.
- Sidebar: only Today, Jobs, CVs, Projects, then divider, then Settings — no Portfolio/Analytics/Interview Prep/Job Tailor links in v2 shell (legacy deep links still work if typed; not in nav).
- Active nav: `bg-primary/10` + `text-primary` + 2px left border. Icons 20px. Collapse width 240→64; persist `localStorage` key `resumate.sidebar.collapsed`.
- Mobile `<1024`: sidebar is Sheet only; no permanent left column.
- Main: max-width 1200, padding 32 desktop / 16 mobile.
- Motion: collapse/sheet/dialog use `base` 200ms ease-out; hover `fast` 120ms. No spring/bounce.
- Dark mode first-class via CSS vars in `globals.css`; theme control in profile menu.
- No content KPIs, charts, or page redesign in this task — shell only.
- No `alert()`. Sonner available for Sign out confirmation toast only.

## DoD
- [ ] shadcn installed; `components.json` created; listed primitives present under `components/ui/`
- [ ] Design tokens from `DESIGN_TOKENS.md` applied in `app/globals.css` + Tailwind theme extend
- [ ] `AppShell` + `Sidebar` + `Topbar` + `QuickAddMenu` render; legacy shell no longer wraps dashboard children
- [ ] Sidebar collapse toggle works and persists across reload
- [ ] Topbar breadcrumb derived from route (Home > Section [> Item])
- [ ] Cmd+K button opens placeholder `CommandPalette`
- [ ] Theme menu switches light/dark/system and persists
- [ ] Mobile `<1024`: hamburger opens Sheet with sidebar nav
- [ ] Quick-add offers New job / New CV / New project (stub dialogs or routes OK)
- [ ] loading / empty / error states present (per matrix; empty = N/A)
- [ ] responsive at 640 / 1024 / 1280
- [ ] dark mode
- [ ] no file outside allowed_paths touched (`services/**`, `store/**`, `api/**`, `hooks/useQuery*`, `prisma/**`, `data/**` forbidden)
- [ ] tsc + eslint pass
