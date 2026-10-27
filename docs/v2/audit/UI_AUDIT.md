# UI Audit

Observable UX only. No aesthetic opinions.
Screens mapped to current routes per `ROUTE_MAP.md`.

---

## Today Dashboard

**Route:** `/dashboard` — `frontend/src/app/dashboard/page.tsx`

### Current structure
- Quick Action Banner (Job Tailor / AI Wizard / Templates CTAs)
- Welcome header
- Stats Overview: 4 equal KPI cards (Total CVs, Projects, Tailored CVs, Success Rate)
- Quick Actions: link cards to CV / Projects / Job Tailor / Interview Prep / Portfolio
- `RecentCvsSection` (`frontend/src/components/dashboard/RecentCvsSection.tsx`)
- Recent Projects list (inline; only if `projects.length > 0`)
- Getting Started block (only if both CVs and projects empty)
- Tips + Performance progress bars
- `OnboardingTour`

### Data flow
- `useAuth().user` → welcome name, profile completeness calc
- `useCvsPaginated({ limit: 50 })` → KPIs, tailored count, success rate, getting-started gate
- `useQuery(["projects"])` → project KPI, recent projects, getting-started gate
- `RecentCvsSection` runs a **second** `useCvsPaginated` independently
- Local: `showOnboarding` + `localStorage.hasSeenOnboarding`

### UX bottlenecks
| Sev | Issue |
|---|---|
| High | No page-level loading: `useCvsPaginated` / projects query unused `isLoading` — KPIs render as `0` then jump when data arrives (`page.tsx` has no loading branch). |
| High | No page-level error UI if CV or projects queries fail — failures are silent; KPIs stay at empty defaults. |
| High | Four equal KPI cards sit above primary work CTAs; Quick Actions are a second 4–5 card grid — primary “next action” competes with metrics density. |
| Med | Duplicate CV fetch: page + `RecentCvsSection` both call `useCvsPaginated` (different limits) — extra network/cache churn on first paint. |
| Med | Recent Projects “Eye” button links to `/dashboard/projects` list, not a project detail (no detail route exists). |
| Low | Getting Started empty CTA only when **both** CVs and projects are empty — user with projects but no CVs never sees upload CTA in that block. |

### Missing states
| State | Present? | Notes |
|---|---|---|
| Loading | Partial | Only inside `RecentCvsSection` (`CVLoadingSkeleton`). Page shell/KPIs: **missing**. |
| Empty | Partial | Getting Started + RecentCvs empty; no empty for “no projects” when CVs exist. |
| Error | Partial | RecentCvs has error banner; page-level CV/projects: **missing**. |
| Success | Yes | Populated KPIs, lists, banners. |

### Dead UI
- Lucide imports `Upload`, `Users`, `GraduationCap`, etc. are used; no orphan buttons found on this page.
- `selectedCv`-style dead state: N/A here.

---

## Jobs

**Current stand-in:** Job Tailor History — `frontend/src/components/job-tailor/JobTailorHistory.tsx` embedded in `/dashboard/job-tailor`.
**Gap:** No `/jobs` (or `/dashboard/jobs`) route, no saved-views/filters/bulk-actions surface matching TASKS `jobs-list`.

### Current structure
- Section header + row count
- Loading text / empty text / HTML `<table>` of history rows
- Per-row actions: view analysis, cover letter, JD, reuse, copy link, open tailored CV

### Data flow
- Props: `cvs`, `tailoredCvs` from parent page
- `useQuery(["job-tailor-analyses"])` → `cvApi.getUserAnalyses`
- `useQuery(["job-tailor-cover-letters"])` → `cvApi.getUserCoverLetters`
- Client merge/sort into `JobTailorHistoryRow[]`
- Callbacks bubble to Job Tailor page for modals / form fill

### UX bottlenecks
| Sev | Issue |
|---|---|
| High | Jobs is not a first-class screen — history is buried below the tailor workspace on the same long page; cannot deep-link to “jobs list only”. |
| High | No error UI when analyses or cover-letter queries fail (`isError` unused) — table can appear empty while requests failed. |
| Med | Empty state is text-only (`jobTailor.history.empty`) — no CTA to start a tailor/analyze. |
| Med | Loading is plain text, not shape-correct skeleton matching table rows. |
| Low | Horizontal scroll table on small viewports; action columns dense with icon buttons. |

### Missing states
| State | Present? | Notes |
|---|---|---|
| Loading | Yes | Text placeholder |
| Empty | Yes | Text only, no CTA |
| Error | **Missing** | |
| Success | Yes | Table rows |

### Dead UI
- None observed in history actions (handlers wired from parent).

---

## CVs

**Route:** `/dashboard/cv` — `frontend/src/app/dashboard/cv/page.tsx` + `frontend/src/components/cv/CvManager.tsx`

### Current structure
- Page header (`layout/DashboardLayout`)
- Mode toggle: paginated vs infinite
- Action row: Upload, Export All, Settings, AI Wizard, Create New
- Search + sort + ASC/DESC + grid/list toggle
- `CvManager` → multi-select toolbar + `CVCard` grid/list + pagination/load-more
- Modals: Upload (`CVUpload`), `CVSettingsModal`, `RenameCvModal` (from manager)

### Data flow
- Page holds `search` / `sortBy` / `sortOrder` / `viewMode` / `mode` / `selectedCv`
- `CvManager` → `useCvsPaginated` or `useCvsInfinite` with those params
- Mutations via `cvApi` inside manager (`useCVActions` pattern for some paths)
- `selectedCv` set via `onSelectCv` but Quick Stats block that consumed it is **commented out**

### UX bottlenecks
| Sev | Issue |
|---|---|
| High | Empty state in `CvManager` is yellow info box with **no CTA** (upload/create) — page has Upload in header but empty message does not point there. |
| High | Control density: pagination/infinite toggle + 5 header actions + search/sort/view toolbar before any cards — on short viewports, first cards push below fold. |
| Med | `handleUploadError` only `console.error` — no toast/inline error on failed upload. |
| Med | `handleExportAll` failures per-CV only logged; no aggregate success/error feedback. |
| Med | `selectedCv` state updated on card select but related Quick Stats UI is commented — selection appears to do nothing. |
| Low | Search `<form onSubmit={handleSearch}>` is a no-op preventDefault; filtering already works via controlled `search` prop. |

### Missing states
| State | Present? | Notes |
|---|---|---|
| Loading | Yes | Pulse card skeletons in `CvManager` |
| Empty | Partial | Present but **no CTA** |
| Error | Yes | Banner + Try Again |
| Success | Yes | Grid/list |

### Dead UI
- Commented Quick Stats / Help Section blocks in `cv/page.tsx` (lines ~244–325) — dead markup.
- `selectedCv` drives no visible UI while uncommented stats are gone.
- Orphan components (not mounted from this screen but dead in repo): `EditCVModal`, `OriginalCVModal`, `CVDisplayExample`.

---

## Projects

**Route:** `/dashboard/projects` — `frontend/src/app/dashboard/projects/page.tsx`

### Current structure
- Page header + Add Project button
- Loading spinner / error banner / empty CTA / card grid
- `ProjectCard` per project (tech tags, CV badges, edit/delete/manage CVs, links)
- Stats strip (total / linked-to-CV / tech count) when non-empty
- Modals: `ProjectForm` in `Modal`, `CVMultiSelectionModal`

### Data flow
- `useQuery(["projects"])` → list
- `useCvsPaginated` → badges + manage-CVs
- Mutations: create / update / delete / sync CVs → invalidate `projects` (+ `cvs` on sync)
- Local: `showForm`, `editingProject`, `showManageCVsModal`, `selectedProject`

### UX bottlenecks
| Sev | Issue |
|---|---|
| High | Create/edit uses `Modal` with **8 fields** (name, role, techStack, description, results, demo, github, image) — long form inside modal (`ProjectForm.tsx`). |
| Med | Nested layouts: page wraps `layout/DashboardLayout` inside shell already providing padding → double `min-h-screen` / header chrome. |
| Med | Delete uses native `confirm()` — blocks UI thread; inconsistent with CV delete modal. |
| Med | Loading is centered spinner only — not shape-correct card skeleton. |
| Low | Error banner has no retry button (unlike CvManager). |

### Missing states
| State | Present? | Notes |
|---|---|---|
| Loading | Yes | Spinner |
| Empty | Yes | Icon + copy + Add First Project CTA |
| Error | Yes | Banner, **no retry** |
| Success | Yes | Grid + stats |

### Dead UI
- None: edit/delete/manage CVs handlers wired.

---

## Job Workspace

**Route:** `/dashboard/job-tailor` — `frontend/src/app/dashboard/job-tailor/page.tsx` (~1448 LOC)

### Current structure
- Page header
- Empty: no CVs → upload CTA
- Else 2-column grid:
  - Left: CV search/sort/filter + scrollable CV list + JD textarea + action buttons (tailor / analyze / cover letter)
  - Right: results / tailored CV preview (`CVDisplay`) / scores
- Collapse sections, processing modal, analysis modal, cover letter modal, JD modal
- `JobTailorHistory` below (Jobs stand-in)

### Data flow
- `useCvsPaginated({ limit: 100 })` → CV list + tailored history subset
- URL `?cvId` / `?jobDescriptionId` → auto-select / open JD
- Mutations: tailor, analyze, cover letter → toast + local result state + query invalidation
- `openTrackedJd` → `cvApi.getJobDescription`
- Heavy local UI state (search, sort, modals, processing type, tracked JD, etc.)

### UX bottlenecks
| Sev | Issue |
|---|---|
| High | CV list chrome (search + sort chips + tailored filter + max-h-80 list) sits **above** the job description input — primary paste/action is pushed down. |
| High | No error branch for CV list query failure — only `isLoading` handled; failed load falls through toward empty/incomplete UI. |
| Med | Single monolith page owns list + workspace + history + export — hard to isolate loading/empty per region; long scroll to history. |
| Med | Empty-of-CVs uses `window.location.href = "/dashboard/cv"` instead of router navigation. |
| Med | Processing + result errors partially toast; tailor error also inline — inconsistent recovery paths. |
| Low | “Auto-selected” badge English hardcode (`Auto-selected`) when deep-linked. |

### Missing states
| State | Present? | Notes |
|---|---|---|
| Loading | Partial | Full-page spinner for CV fetch; history has own loading; mutations use ProcessingModal |
| Empty | Yes | No-CVs CTA; filtered-CV empty; history empty |
| Error | Partial | Mutation errors toasted/inline; **list-load error missing**; history error missing |
| Success | Yes | Tailored preview, analysis/cover modals, history rows |

### Dead UI
- No clearly unwired primary buttons observed in the main action row.
- Duplicate modal implementations (CoverLetter / Compatibility vs CV module) create two UIs for same job — not dead, but divergent.

---

## Cross-cutting (affects all 5)

| Sev | Issue |
|---|---|
| High | Two `DashboardLayout` components with the same name; CV/Projects/Job Tailor pages nest page-header layout inside shell → redundant headers/padding. |
| Med | Primary interactive primitive is custom `button.tsx`; parallel `dialog.tsx` largely unused while `Modal.tsx` dominates — inconsistent overlay behavior. |
| Med | No dark-mode handling observed on these screens (light gray/white hard classes). |
