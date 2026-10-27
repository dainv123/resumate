# Task Queue

Task schema:
- id, screen, status (todo|designing|spec_approved|implementing|verifying|done|blocked)
- branch: feat/ui-<id>
- allowed_paths: [list]
- forbidden_paths: [list]
- spec: docs/v2/design/SCREEN_SPECS/<id>.md
- dod: [list]
- iterations / max_iterations: 3

## Tasks
- id: foundation
  screen: app-shell
  status: done
  branch: feat/ui-foundation
  allowed_paths: [app/layout.tsx, app/(app)/layout.tsx, app/dashboard/layout.tsx, components/layout/**, components/ui/**, components/command/**, lib/utils.ts, tailwind.config.*, app/globals.css, components.json]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/foundation.md
  dod: [shadcn installed, theme tokens applied, sidebar+topbar render, dark mode toggle works, typecheck+lint pass]
  iterations: 1
  max_iterations: 3
  verify_report: docs/v2/log/VERIFY_REPORTS/foundation.md

- id: command-palette
  screen: global
  status: done
  branch: feat/ui-command-palette
  allowed_paths: [components/command/**, app/layout.tsx]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/command-palette.md
  dod: [Cmd+K opens, jump to job/cv/project, create actions, theme toggle, typecheck+lint pass]
  iterations: 1
  max_iterations: 3
  verify_report: docs/v2/log/VERIFY_REPORTS/command-palette.md

- id: today-dashboard
  screen: today
  status: todo
  branch: feat/ui-today-dashboard
  allowed_paths: [app/(app)/today/**, components/today/**]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/today-dashboard.md
  dod: [hero next-action card, 3-KPI strip, today timeline, applied-this-week list, loading/empty/error, responsive, typecheck+lint pass]
  iterations: 0
  max_iterations: 3

- id: jobs-list
  screen: jobs
  status: todo
  branch: feat/ui-jobs-list
  allowed_paths: [app/(app)/jobs/**, components/jobs/**]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/jobs-list.md
  dod: [data table, saved views, filter popover, quick-add dialog, bulk actions, loading/empty/error, typecheck+lint pass]
  iterations: 0
  max_iterations: 3

- id: cvs-grid
  screen: cvs
  status: todo
  branch: feat/ui-cvs
  allowed_paths: [app/(app)/cvs/**, components/cvs/**]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/cvs-grid.md
  dod: [card grid, preview thumb, version badge, usage count, empty state, typecheck+lint pass]
  iterations: 0
  max_iterations: 3

- id: projects-grid
  screen: projects
  status: todo
  branch: feat/ui-projects
  allowed_paths: [app/(app)/projects/**, components/projects/**]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/projects-grid.md
  dod: [card grid, cover image, tech tags, linked CV badge, empty state, typecheck+lint pass]
  iterations: 0
  max_iterations: 3

- id: job-workspace
  screen: workspace
  status: todo
  branch: feat/ui-job-workspace
  allowed_paths: [app/(app)/jobs/[id]/**, components/workspace/**]
  forbidden_paths: [services/**, store/**, api/**, hooks/useQuery*, prisma/**]
  spec: docs/v2/design/SCREEN_SPECS/job-workspace.md
  dod: [stage stepper header, tabs overview/cv/notes/contacts/timeline, right rail next-action, mobile sheet, quick-log dialog, typecheck+lint pass]
  iterations: 0
  max_iterations: 3
