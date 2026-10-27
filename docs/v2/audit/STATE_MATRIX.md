# State Matrix

Brutal pass over loading / empty / error / success for the five redesign screens (current routes).
“Present” means a dedicated UI branch exists in code — not merely a toast or console.log.

| Screen | Route / stand-in | Loading | Empty | Error | What's missing |
|---|---|---|---|---|---|
| Today Dashboard | `/dashboard` (`app/dashboard/page.tsx`) | **Partial** — only `RecentCvsSection` skeleton; page KPIs/quick actions have **no** loading branch | **Partial** — Getting Started when both lists empty; RecentCvs empty CTA; no projects-only empty | **Partial** — RecentCvs error banner only; page-level CV/projects errors **absent** | Page-level loading skeleton (KPI + cards); page-level error + retry; empty when projects=0 but CVs>0 |
| Jobs | Job Tailor History (`components/job-tailor/JobTailorHistory.tsx`) — **no `/jobs` route** | **Yes** — text “loading” | **Partial** — text empty, **no CTA** | **No** — `isError` never handled | Dedicated Jobs route/screen; error + retry; empty CTA; table-shaped skeleton |
| CVs | `/dashboard/cv` (`CvManager`) | **Yes** — pulse card grid | **Partial** — message only, **no CTA** | **Yes** — banner + Try Again | Empty-state CTA (upload/create); upload/export failure UI (currently console-only on page) |
| Projects | `/dashboard/projects` | **Yes** — spinner (not card-shaped) | **Yes** — copy + Add First Project CTA | **Partial** — banner, **no retry** | Shape-correct loading skeleton; error retry |
| Job Workspace | `/dashboard/job-tailor` | **Partial** — full-page spinner for CV fetch; ProcessingModal for mutations; history separate | **Yes** — no-CVs CTA; filter miss; history empty | **Partial** — mutation toasts/inline; **CV list load error absent**; history error absent | List-load error + retry; regional loading instead of blanking whole workspace; history error |

---

## Detail checklist

### Today Dashboard
- [ ] Loading (page)
- [x] Loading (Recent CVs subsection)
- [x] Empty (zero CVs + zero projects → Getting Started)
- [x] Empty (Recent CVs subsection)
- [ ] Empty (projects-only)
- [ ] Error (page CV query)
- [ ] Error (page projects query)
- [x] Error (Recent CVs)
- [x] Success

### Jobs (History stand-in)
- [x] Loading
- [x] Empty (text)
- [ ] Empty CTA
- [ ] Error
- [x] Success
- [ ] First-class Jobs screen (route)

### CVs
- [x] Loading
- [x] Empty (message)
- [ ] Empty CTA inside list
- [x] Error + retry
- [x] Success
- [ ] Upload error surfaced to user
- [ ] Export-all error surfaced to user

### Projects
- [x] Loading (spinner)
- [ ] Loading (shape-correct cards)
- [x] Empty + CTA
- [x] Error (message)
- [ ] Error retry
- [x] Success

### Job Workspace
- [x] Loading (initial CV list)
- [x] Loading (mutation ProcessingModal)
- [x] Empty (no CVs + CTA)
- [x] Empty (filtered CV list)
- [ ] Error (CV list fetch)
- [x] Error (mutations — toast/inline)
- [x] Success (preview / modals)
- [ ] Error (history queries)

---

## Summary counts

| | Present | Partial | Missing |
|---|---|---|---|
| Loading | 2 screens solid | 3 partial | — |
| Empty | 1 solid (Projects) | 4 partial / text-only | — |
| Error | 1 solid (CVs) | 3 partial | Jobs fully missing |

**Honest takeaway:** Only **Projects** and **CVs** approach a complete loading/empty/error set; CVs empty lacks a CTA, Projects error lacks retry. **Today** and **Job Workspace** fail open on query errors. **Jobs** has no screen and no error state.
