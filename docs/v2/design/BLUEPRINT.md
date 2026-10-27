# Layout Blueprint

## App Shell
- Fixed left sidebar (240px expanded, 64px collapsed). Collapse persisted in localStorage.
- Topbar (56px): breadcrumb left, Cmd+K trigger center, Quick-add + profile right.
- Main content: max-width 1200, padding 32 desktop / 16 mobile.
- Mobile (<1024): sidebar → Sheet drawer triggered by hamburger.

## Sidebar structure
Today, Jobs, CVs, Projects — divider — Settings.
Active state: bg-primary/10 + text-primary + left border 2px.
Badges: pending count on Jobs (e.g. "3 follow-ups due").

## Topbar
- Breadcrumb: Home > <Section> > <Item>
- Cmd+K button styled as input, placeholder "Search or jump to…", width 320
- Quick-add: dropdown "New job", "New CV", "New project" (each opens Dialog)
- Profile: avatar dropdown → Settings, Theme (light/dark/system), Sign out

## Screen containers
- Table screens (Jobs): full width, no card wrapper. Sticky header, sticky bulk-action footer.
- Grid screens (CVs, Projects): 3-col card grid, gap 24.
- Dashboard (Today): 2-col split 2fr/1fr at >= xl, stacked below.
- Workspace: header full width, tabs below, 2-col 2fr/1fr at >= lg. Right rail collapses to Sheet below lg.

## Feedback primitives
- Loading: Skeleton matched to shape (row-skeleton tables, card-skeleton grids).
- Empty: centered, 48px lucide icon, h2 + body-sm, one CTA button.
- Error: inline banner with Retry button. No alert().
- Mutation: Sonner toast, 3s, Undo for destructive.

## Copy tone
Direct, no exclamation. "Add job" not "Let's add a job!". "No jobs yet. Add your first application." not "Your journey starts here 🚀".
