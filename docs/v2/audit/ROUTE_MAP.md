# Route Map

Source: Next.js App Router under `frontend/src/app/`.
Parent shell for all `/dashboard/*` routes: `frontend/src/app/dashboard/layout.tsx` → `frontend/src/components/dashboard/DashboardLayout.tsx` (Sidebar + MobileHeader + auth gate).

**Redesign screen mapping (current → planned):**
| Planned screen | Current route(s) | Notes |
|---|---|---|
| Today Dashboard | `/dashboard` | Home stats + quick actions |
| Jobs | _(none)_ | Closest stand-in: Job Tailor History table on `/dashboard/job-tailor` |
| CVs | `/dashboard/cv` (+ nested CV routes) | Grid/list manager |
| Projects | `/dashboard/projects` | Card grid + modal form |
| Job Workspace | `/dashboard/job-tailor` | CV select + JD + tailor/analyze/cover-letter |

---

## Main layout routes

| Route | Screen name | Parent layout | Data sources (queries/hooks) | Key actions | Route file |
|---|---|---|---|---|---|
| `/` | Marketing / landing | `frontend/src/app/layout.tsx` | `useAuth`, `useLanguage` | Login/Register CTAs, feature cards | `frontend/src/app/page.tsx` |
| `/[locale]` | Localized landing | `frontend/src/app/layout.tsx` | `useAuth`, `useLanguage` | Same as `/` | `frontend/src/app/[locale]/page.tsx` |
| `/dashboard` | Today Dashboard | `dashboard/layout.tsx` → shell | `useCvsPaginated`, `useQuery(["projects"])` via `projectsApi.getUserProjects`, `useAuth` | Quick-build banner links, KPI strip, nav cards, recent CVs/projects, onboarding tour | `frontend/src/app/dashboard/page.tsx` |
| `/dashboard/cv` | CVs | shell + page header `components/layout/DashboardLayout` | Via `CvManager`: `useCvsPaginated` / `useCvsInfinite`; `cvApi.getUserCvs` on export-all | Upload modal, export all, settings, AI wizard, create CV, search/sort/view mode, bulk delete | `frontend/src/app/dashboard/cv/page.tsx` |
| `/dashboard/projects` | Projects | shell + page header | `useQuery(["projects"])`, `useCvsPaginated`, mutations: create/update/delete/sync CVs | Add/edit project modal, manage CVs modal, delete confirm | `frontend/src/app/dashboard/projects/page.tsx` |
| `/dashboard/job-tailor` | Job Workspace (+ Jobs stand-in history) | shell + page header | `useCvsPaginated`; mutations tailor/analyze/cover-letter; `cvApi.getJobDescription`; history: `cvApi.getUserAnalyses`, `cvApi.getUserCoverLetters` | Select CV, paste JD, tailor, analyze, cover letter, export, history reuse/copy-link | `frontend/src/app/dashboard/job-tailor/page.tsx` |
| `/dashboard/interview-prep` | Interview Prep list | shell | `useQuery` cvs + prep plans | Create plan, open plan | `frontend/src/app/dashboard/interview-prep/page.tsx` |
| `/dashboard/portfolio` | Portfolio builder | shell + page header | `portfolioApi` queries/mutations | Multi-step: template → CV → sections → publish | `frontend/src/app/dashboard/portfolio/page.tsx` |
| `/dashboard/analytics` | Analytics | shell + page header | `analyticsApi.getStats`, `getExportHistory`, timeline, activitiesByType | Date range filter, export history pagination | `frontend/src/app/dashboard/analytics/page.tsx` |
| `/dashboard/templates` | Template gallery | shell + page header | Inside `TemplateGallery` | Browse/select templates | `frontend/src/app/dashboard/templates/page.tsx` |
| `/dashboard/ai-wizard` | AI CV Wizard | shell + page header | Inside `AiCvWizard` | Generate CV via wizard | `frontend/src/app/dashboard/ai-wizard/page.tsx` |
| `/dashboard/settings` | Settings | shell + page header | Local fetch + auth/profile APIs | Update profile, password, delete account | `frontend/src/app/dashboard/settings/page.tsx` |

---

## Nested routes

| Route | Screen name | Parent layout | Data sources (queries/hooks) | Key actions | Route file |
|---|---|---|---|---|---|
| `/dashboard/cv/[id]` | CV detail | shell + page header | `useQuery(["cv", id])` → `cvApi.getCvWithRelatedData`; delete mutation | View, rename, delete, export, template config, JD/matching/cover-letter modals | `frontend/src/app/dashboard/cv/[id]/page.tsx` |
| `/dashboard/cv/[id]/edit` | CV edit | shell + page header | CV load + update | Edit parsed CV fields | `frontend/src/app/dashboard/cv/[id]/edit/page.tsx` |
| `/dashboard/cv/create` | CV create | shell + page header | Create mutation | Create blank/manual CV | `frontend/src/app/dashboard/cv/create/page.tsx` |
| `/dashboard/cv/compare` | CV compare | shell | `useQuery` for two CV ids from search params | Diff two CVs | `frontend/src/app/dashboard/cv/compare/page.tsx` |
| `/dashboard/interview-prep/[id]` | Interview Prep workspace | shell | `useQuery` plan by id; mock/mutations | Sections: focus, questions, STAR, defense, research, survey | `frontend/src/app/dashboard/interview-prep/[id]/page.tsx` |

---

## Auth routes (no dashboard shell)

| Route | Screen name | Parent layout | Data sources | Key actions | Route file |
|---|---|---|---|---|---|
| `/auth/login` | Login | root layout | `useAuth.login` | Email/password, Google OAuth | `frontend/src/app/auth/login/page.tsx` |
| `/auth/register` | Register | root layout | `useAuth` register | Sign up, Google OAuth | `frontend/src/app/auth/register/page.tsx` |
| `/auth/callback` | OAuth callback | root layout | Auth callback handling | Complete OAuth redirect | `frontend/src/app/auth/callback/page.tsx` |

---

## Modal-only surfaces (no dedicated route)

Opened from parent pages; not independently routed.

| Surface | Hosted from | Component path |
|---|---|---|
| CV upload | `/dashboard/cv` | `frontend/src/components/cv/CVUpload.tsx` inside `Modal` |
| CV settings | `/dashboard/cv` | `frontend/src/components/cv/CVSettingsModal.tsx` |
| Rename CV | CV list / detail | `frontend/src/components/cv/RenameCvModal.tsx` |
| Delete CV confirm | CV detail / RecentCvsSection ad-hoc | `frontend/src/components/cv/DeleteConfirmationModal.tsx` (+ inline modal in `RecentCvsSection`) |
| Template selection / config | CV detail | `TemplateSelectionModal.tsx`, `TemplateConfigModal.tsx` |
| Job description viewer | Job Tailor / CV detail | `frontend/src/components/cv/JobDescriptionModal.tsx` |
| Compatibility / matching analysis | Job Tailor / CV detail | `job-tailor/CompatibilityAnalysisModal.tsx`, `cv/MatchingAnalysisModal.tsx` |
| Cover letter | Job Tailor / CV detail | `job-tailor/CoverLetterModal.tsx`, `cv/CoverLetterModal.tsx` |
| Processing overlay | Job Tailor | `frontend/src/components/job-tailor/ProcessingModal.tsx` |
| Project form | `/dashboard/projects` | `ProjectForm` in `Modal` |
| Manage project↔CVs | `/dashboard/projects` | `frontend/src/components/projects/CVMultiSelectionModal.tsx` |
| Version history | CV flows | `frontend/src/components/cv/VersionHistoryModal.tsx` |
| Onboarding tour | `/dashboard` | `frontend/src/components/onboarding/OnboardingTour.tsx` |
| Interview prep upgrade / survey / onboarding | Interview Prep | `ProUpgradeModal`, `PostInterviewSurveyModal`, `InterviewPrepOnboardingWizard` |

---

## Layout files

| File | Role |
|---|---|
| `frontend/src/app/layout.tsx` | Root HTML, Providers, GA, SEO |
| `frontend/src/app/providers.tsx` | React Query, Auth, Language, Toast |
| `frontend/src/app/dashboard/layout.tsx` | Wraps children in shell `DashboardLayout` |
| `frontend/src/components/dashboard/DashboardLayout.tsx` | Auth gate, Sidebar, MobileHeader, JdPasteBar |
| `frontend/src/components/layout/DashboardLayout.tsx` | **Different component, same name** — page title/subtitle/back/headerActions only |

---

## Gaps vs redesign TASKS.md routes

| Planned path (TASKS) | Exists today? |
|---|---|
| `app/(app)/today/**` | No — use `/dashboard` |
| `app/(app)/jobs/**` | No dedicated jobs list |
| `app/(app)/cvs/**` | No — use `/dashboard/cv` |
| `app/(app)/projects/**` | No — use `/dashboard/projects` |
| `app/(app)/jobs/[id]/**` | No — job workspace is single page `/dashboard/job-tailor` with query `?cvId=&jobDescriptionId=` |
