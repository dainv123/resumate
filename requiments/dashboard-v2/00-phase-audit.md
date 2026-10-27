# Phase 0 — Audit (read-only)

Audit tại thời điểm redesign v2. Chi tiết đầy đủ trong chat; đây là bản track.

## Routes dashboard

| Route | File |
|-------|------|
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/cv/*` | create, `[id]`, edit, compare |
| `/dashboard/job-tailor` | ~1448 LOC monolith |
| `/dashboard/interview-prep`, `/[id]` | list + workspace |
| `/dashboard/projects`, `portfolio`, `analytics`, `settings` | |
| `/dashboard/templates`, `ai-wizard` | secondary |

## Layouts

- Shell: `app/dashboard/layout.tsx` → `components/dashboard/DashboardLayout.tsx` (Sidebar, MobileHeader, auth, JdPasteBar)
- Page chrome (tên trùng): `components/layout/DashboardLayout.tsx` — lồng trong hầu hết page trừ Home

## Data model (không có Job/Application)

```
User → Cv (master | tailored via originalCvId, jobDescriptionId)
     → JobDescription
     → CvMatchingAnalysis (unique cvId + jobDescriptionId + userId)
     → CvCoverLetter (unique tương tự)
     → InterviewPrepPlan (cvId + jobDescriptionId + interviewDate)
```

- `GET /cv/job-descriptions/:id` có; **list JD** có trong service (`getUserJobDescriptions`) nhưng **chưa expose controller**.
- Job Tailor history = client merge analyses + cover letters + tailored CVs.

## Deep-links cần giữ

| Cơ chế | Chi tiết |
|--------|----------|
| `?cvId=` / `?jobDescriptionId=` | Job Tailor |
| `buildJobTailorLink` | Copy link history |
| `?v1=&v2=` | CV compare |
| sessionStorage prep prefill | cvId + JD text → Interview Prep |
| `#prep-section-*` | Prep detail scroll |

## UI kit

- Không shadcn thật (không Radix, không `components.json`)
- Custom `Button`, `Modal`, `Input` + file tên shadcn hand-rolled
- Tokens: `--main-color`, `--dark-color`, `--blue-color`, `--yellow-color`; Karla/Inter
- i18n: `locales/en.json`, `vi.json` + `LanguageContext`

## Rủi ro tách UI

- `job-tailor/page.tsx` monolith (UI + URL sync + 3 mutations)
- Metrics logic trong Home page
- Double `min-h-screen` / padding
- Paywall rải rác (`ProUpgradeModal`)
