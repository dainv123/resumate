# Component Inventory

Scope: UI components used by **Today Dashboard**, **Jobs** (Job Tailor History stand-in), **CVs**, **Projects**, **Job Workspace**.
Library note: `package.json` has **no MUI / Radix / shadcn CLI deps**. Files under `components/ui/{badge,button,card,dialog,label,select,switch,tabs}.tsx` are custom Tailwind primitives (shadcn-_shaped_, not installed shadcn). Primary Button used app-wide is `frontend/src/components/ui/button.tsx` imported as `@/components/ui/Button`.

---

## Shared primitives & layout

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/components/ui/button.tsx` | primitive | custom (tailwind) | shared-global | replace-with-shadcn (`Button`) |
| `frontend/src/components/ui/Button/` | — | empty directory | — | delete |
| `frontend/src/components/ui/Modal.tsx` | primitive | custom | shared-global | replace-with-shadcn (`Dialog`) |
| `frontend/src/components/ui/dialog.tsx` | primitive | custom | unique (near-unused) | delete or merge into shadcn Dialog — **duplicates Modal** |
| `frontend/src/components/ui/Input.tsx` | primitive | custom | shared-global | replace-with-shadcn (`Input`/`Textarea`) |
| `frontend/src/components/ui/Collapse.tsx` | primitive | custom | shared-in-module | wrap → shadcn `Collapsible` |
| `frontend/src/components/ui/badge.tsx` | primitive | custom | shared-global | replace-with-shadcn |
| `frontend/src/components/ui/card.tsx` | primitive | custom | shared-in-module | replace-with-shadcn |
| `frontend/src/components/ui/label.tsx` | primitive | custom | shared-in-module | replace-with-shadcn |
| `frontend/src/components/ui/select.tsx` | primitive | custom | shared-in-module | replace-with-shadcn |
| `frontend/src/components/ui/switch.tsx` | primitive | custom | shared-in-module | replace-with-shadcn |
| `frontend/src/components/ui/tabs.tsx` | primitive | custom | shared-in-module | replace-with-shadcn |
| `frontend/src/components/ui/LoadingSkeleton.tsx` | primitive | custom | shared-global | keep (or align with shadcn `Skeleton`) |
| `frontend/src/components/ui/Toast.tsx` | primitive | custom | shared-global | replace-with-shadcn (`Sonner`/`Toast`) |
| `frontend/src/components/dashboard/DashboardLayout.tsx` | layout | custom | shared-global | keep shell; restyle with tokens |
| `frontend/src/components/dashboard/Sidebar.tsx` | layout | custom | shared-global | keep / restyle |
| `frontend/src/components/dashboard/MobileHeader.tsx` | layout | custom | shared-global | keep / restyle |
| `frontend/src/components/layout/DashboardLayout.tsx` | layout | custom | shared-global | **rename** (collides with shell) → keep as page header or replace with shadcn page header pattern |
| `frontend/src/components/onboarding/OnboardingTour.tsx` | feature | custom | unique | keep (out of core redesign screens unless Today requires it) |

---

## Today Dashboard (`/dashboard`)

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/app/dashboard/page.tsx` | container | custom + lucide | unique | keep container; replace inline cards with shadcn primitives |
| `frontend/src/components/dashboard/RecentCvsSection.tsx` | feature | custom | unique | keep; replace ad-hoc delete overlay with shared `AlertDialog` |
| `frontend/src/components/cv/CVGrid.tsx` | feature | custom | shared-in-module | keep |
| `frontend/src/components/cv/CVCard.tsx` | feature | custom | shared-in-module | keep; restyle |
| `frontend/src/components/cv/CVLoadingSkeleton.tsx` | primitive | custom | shared-in-module | keep — **duplicates** pulse patterns in `CvManager` / `LoadingSkeleton` |

Inline in page (not extracted): Quick Action Banner, 4-KPI stats grid, Quick Actions cards, Recent Projects list, Getting Started, Tips, Performance bars.

---

## Jobs (stand-in: Job Tailor History)

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/components/job-tailor/JobTailorHistory.tsx` | feature | custom + table markup | unique | keep as seed for Jobs list; replace table with shadcn `Table` |

No dedicated Jobs list components exist outside this history table.

---

## CVs (`/dashboard/cv` + related)

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/app/dashboard/cv/page.tsx` | container | custom | unique | keep container; thin toolbar |
| `frontend/src/components/cv/CvManager.tsx` | container | custom | shared-in-module | keep; extract list chrome |
| `frontend/src/components/cv/CVCard.tsx` | feature | custom | shared-in-module | keep |
| `frontend/src/components/cv/CVGrid.tsx` | feature | custom | shared-in-module | keep — grid markup also inlined in `CvManager` (**duplicate layout**) |
| `frontend/src/components/cv/CVUpload.tsx` | form | custom + dropzone | shared-in-module | keep |
| `frontend/src/components/cv/CVSettingsModal.tsx` | form | custom + Modal | unique | wrap → shadcn Dialog |
| `frontend/src/components/cv/RenameCvModal.tsx` | form | custom + Modal | shared-in-module | wrap → Dialog |
| `frontend/src/components/cv/DeleteConfirmationModal.tsx` | form | custom | shared-in-module | replace-with-shadcn `AlertDialog` |
| `frontend/src/components/cv/CVBadge.tsx` | primitive | custom | shared-in-module | replace-with-shadcn Badge |
| `frontend/src/components/cv/CVActions.tsx` | feature | custom | shared-in-module | keep (detail page) |
| `frontend/src/components/cv/CVDisplay.tsx` | feature | custom | shared-global | keep |
| `frontend/src/components/cv/CVMetadata.tsx` | feature | custom | shared-in-module | keep |
| `frontend/src/components/cv/CVRelationships.tsx` | feature | custom | shared-in-module | keep |
| `frontend/src/components/cv/JobDescriptionModal.tsx` | feature | custom + Modal | shared-global | keep; Dialog wrap |
| `frontend/src/components/cv/MatchingAnalysisModal.tsx` | feature | custom + Modal | shared-in-module | merge with CompatibilityAnalysisModal |
| `frontend/src/components/cv/CoverLetterModal.tsx` | feature | custom + Modal | shared-in-module | merge with job-tailor CoverLetterModal |
| `frontend/src/components/cv/TemplateConfigModal.tsx` | form | custom + Modal + ui/* | shared-in-module | keep; finish shadcn migration |
| `frontend/src/components/cv/TemplateSelectionModal.tsx` | form | custom + Modal | shared-in-module | keep |
| `frontend/src/components/cv/VersionHistoryModal.tsx` | feature | custom + Modal | shared-in-module | keep |
| `frontend/src/components/cv/CVLoadingSkeleton.tsx` | primitive | custom | shared-in-module | keep |
| `frontend/src/components/cv/EditCVModal.tsx` | form | custom | unique | **delete** — zero importers |
| `frontend/src/components/cv/OriginalCVModal.tsx` | feature | custom | unique | **delete** — zero importers |
| `frontend/src/components/cv/CVDisplayExample.tsx` | feature | custom | unique | **delete** — zero importers |
| `frontend/src/components/cv/DynamicFormEditor.tsx` | form | custom | shared-in-module | keep (edit flow) |
| `frontend/src/components/cv/CvParsedContent.tsx` | feature | custom | shared-in-module | keep |

---

## Projects (`/dashboard/projects`)

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/app/dashboard/projects/page.tsx` | container | custom | unique | keep |
| `frontend/src/components/projects/ProjectCard.tsx` | feature | custom | unique | keep; restyle |
| `frontend/src/components/projects/ProjectForm.tsx` | form | custom + RHF/zod | unique | keep; move from Modal → Sheet/route (8 fields) |
| `frontend/src/components/projects/CVMultiSelectionModal.tsx` | form | custom + Modal | unique | wrap → Dialog |

---

## Job Workspace (`/dashboard/job-tailor`)

| File path | Type | Current library | Reuse | Recommendation |
|---|---|---|---|---|
| `frontend/src/app/dashboard/job-tailor/page.tsx` | container | custom (~1448 LOC) | unique | keep logic; split UI into feature components |
| `frontend/src/components/job-tailor/JobTailorHistory.tsx` | feature | custom | unique | keep |
| `frontend/src/components/job-tailor/ProcessingModal.tsx` | feature | custom | unique | replace-with-shadcn Dialog |
| `frontend/src/components/job-tailor/CompatibilityAnalysisModal.tsx` | feature | custom | unique | merge with `cv/MatchingAnalysisModal` |
| `frontend/src/components/job-tailor/CoverLetterModal.tsx` | feature | custom | unique | merge with `cv/CoverLetterModal` |
| `frontend/src/components/cv/CVDisplay.tsx` | feature | custom | shared-global | keep |
| `frontend/src/components/cv/JobDescriptionModal.tsx` | feature | custom | shared-global | keep |
| `frontend/src/components/ui/Collapse.tsx` | primitive | custom | shared-in-module | wrap |

---

## Duplicate / collision flags

| Pair | Same purpose | Action |
|---|---|---|
| `components/dashboard/DashboardLayout.tsx` vs `components/layout/DashboardLayout.tsx` | Both named DashboardLayout; shell vs page chrome | Rename page chrome; avoid double-wrap |
| `ui/Modal.tsx` vs `ui/dialog.tsx` | Modal/dialog overlay | One shadcn Dialog |
| `ui/button.tsx` vs empty `ui/Button/` | Import path collision risk on case-sensitive FS | Delete empty dir |
| `cv/CoverLetterModal.tsx` vs `job-tailor/CoverLetterModal.tsx` | Display/copy cover letter | Merge to one |
| `cv/MatchingAnalysisModal.tsx` vs `job-tailor/CompatibilityAnalysisModal.tsx` | Show compatibility score/skills | Merge to one |
| `CVGrid` grid vs inline grid in `CvManager` | CV card layout | Prefer `CVGrid` only |
| `CVLoadingSkeleton` vs `LoadingSkeleton` vs pulse blocks in `CvManager` | Loading placeholders | One skeleton system |
| `DeleteConfirmationModal` vs ad-hoc delete UI in `RecentCvsSection` | Confirm delete | Reuse modal |
| Inline CV picker rows on Job Tailor vs `CVCard` | Select a CV | Consider shared selectable card |

---

## Counts (this inventory)

- Components listed: **58** (including dead/empty)
- Flagged delete: **4** (`EditCVModal`, `OriginalCVModal`, `CVDisplayExample`, empty `Button/`)
- Duplicate pairs flagged: **9**
