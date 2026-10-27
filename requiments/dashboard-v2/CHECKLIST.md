# Dashboard v2 — Checklist

Nguồn sự thật: [README](./README.md) · [DECISIONS](./DECISIONS.md) · [03a](./03a-status-primary-redirects.md) · [04](./04-phase-implementation.md)

---

## A. Docs / design (rev 6.1) — DONE

- [x] Phase 0 audit
- [x] Phase 1 IA (Application-centric, nav 5)
- [x] Phase 2 design system (navy primary, accent-foreground, `--ring`)
- [x] Phase 3 wireframes
- [x] Status model 2 trục + primary rules + T01–T25 / P01–P07
- [x] Snooze = hide Today; offer không snooze; skipTailor → mark_applied
- [x] Analyze phụ; Tailor chỉ `saved`
- [x] interviewDate + Time? + Tz (profile)
- [x] Phase 4 PR plan (3a/3b tách)
- [x] Deep-link `/jobs/from` POST + redirect table
- [x] Backfill skipTailor; CV delete rules; quota reserve

---

## B. Trước mỗi PR

- [ ] Đọc scope PR trong [04](./04-phase-implementation.md)
- [ ] Không mở rộng sang PR sau
- [ ] lint + typecheck + build
- [ ] Rollback path ghi trong PR description
- [ ] Deep-link trong phạm vi “from PR” không 404

---

## C. PR1 — Shell / tokens  ← **NEXT**

- [ ] `npx shadcn@latest init` (Tailwind 4 + Next 15)
- [ ] CSS vars: `--primary` `#130F49`, `--accent` `#FF972D`, `--accent-foreground` `#7A3F00`, `--ring` `#A5A6FF`, background/card/border
- [ ] StatusBadge interviewing: bg accent/15 + text accent-foreground
- [ ] Components: PageHeader, EmptyState (+ sticky content padding)
- [ ] Áp PageHeader dần thay `layout/DashboardLayout` chrome (hoặc wrap)
- [ ] **Không** đổi Sidebar routes / nav labels
- [ ] Plan badge `Name · Free|Pro` trên user menu (optional sớm)
- [ ] Visual smoke: /dashboard, /cv, /job-tailor, /settings
- [ ] lint · typecheck · build

---

## D. PR2 — CV restyle

- [ ] Restyle `/dashboard/cv` + detail (giữ slug `/cv`)
- [ ] Primary `New CV ▾`: Upload · AI Wizard · Template (**Blank ẩn**)
- [ ] Filter default Master; tailored `↳ for {job}`
- [ ] Quick tailor → `/job-tailor?cvId=` (cũ)
- [ ] Row ⋯: View · Edit · Rename · Quick tailor · Duplicate · Delete
- [ ] lint · typecheck · build

---

## E. PR3a — Application schema + backfill

- [ ] Entity + migration Application
- [ ] Fields: status, skipTailor, origin, interviewDate/Time/Tz, snoozedUntil, soft delete
- [ ] Partial unique `(userId, sourceCvId, jobDescriptionId) WHERE deletedAt IS NULL`
- [ ] `application_status_events` + first-reach timestamps
- [ ] Orphan audit script (trước backfill)
- [ ] Backfill: `origin=backfill`, `skipTailor=true` nếu !tailored
- [ ] API list trả artifact flags + matchScore
- [ ] CV delete: block chỉ applied|interviewing|offer
- [ ] Nếu estimate > 1 tuần → tách schema / backfill / interview columns
- [ ] Tests migration + backfill idempotent
- [ ] lint · typecheck · build BE

---

## F. PR3b — AiJob + quota + from

- [ ] AiJob entity + lifecycle (pending|running|done|failed)
- [ ] Unique active `(applicationId, type)`
- [ ] Timeout → failed + release quota
- [ ] QuotaService: reserve@pending · commit@done · release@fail
- [ ] Wire đường cũ tailor/analyze/letter qua cùng QuotaService
- [ ] Dual-write applicationId lên analysis/letter mới
- [ ] POST `/applications/from` + upsert
- [ ] Bridge page (no GET create); unique fail → “Already exists”
- [ ] Race / double-click tests
- [ ] lint · typecheck · build

---

## G. PR4 — Jobs UI + cutover

- [ ] `/jobs` list + funnel strip (placeholder ok)
- [ ] `/jobs/new` (status picker, title heuristic, no tz picker)
- [ ] Redirect `/job-tailor` → jobs; deep-link → bridge
- [ ] Nav: bật Jobs, ẩn Job Tailor
- [ ] Prep vẫn link `/interview-prep` tạm
- [ ] Re-backfill / dual-write cutover
- [ ] Quick tailor → `/jobs/new?cvId=&intent=tailor`
- [ ] Feature flag rollback → hiện lại Job Tailor
- [ ] lint · typecheck · build

---

## H. PR5 — Job workspace + helper

- [ ] Routes Overview | Analysis | Documents
- [ ] `getJobPrimaryAction(app, {now,tz})` + tests T01–T25
- [ ] `getJobTodayPriority` + P01–P07 (có thể ship helper trước, Today dùng ở PR6)
- [ ] Aside progress; Analyze outline; Match column
- [ ] AiJob poll; toast + **notification bell** (5 + View all)
- [ ] Mobile `[←] Title [⋯]`; Unsnooze
- [ ] Empty CTA không trùng header primary
- [ ] Prep tab = link tạm cũ
- [ ] lint · typecheck · build

---

## I. PR6 — Today

- [ ] Thay gallery home bằng Next up + queue
- [ ] Eligible: !snooze, !closed-as-reopen-only, !deleted
- [ ] All caught up / empty 0 CV / 0 job
- [ ] Mobile sticky-only; card tap + “Next:”
- [ ] Rename nav Dashboard → Today (nếu flag)
- [ ] lint · typecheck · build

---

## J. PR7 — Prep

- [ ] `/jobs/[id]/prep/*`
- [ ] Practice fullscreen: Back · Q i/n · Exit + autosave
- [ ] Redirect `/interview-prep`
- [ ] SSOT interview fields từ Application
- [ ] lint · typecheck · build

---

## K. PR8 — Projects + Settings

- [ ] Nav label Projects; path `/projects` giữ
- [ ] Settings: Account (+ Language) · Plan · Danger
- [ ] Plan badge user menu
- [ ] **Giữ** link Analytics
- [ ] lint · typecheck · build

---

## L. PR9 — Portfolio

- [ ] Stepper Continue → Publish (last)
- [ ] Published: Update / Unpublish
- [ ] lint · typecheck · build

---

## M. PR10 — Funnel + cleanup

- [ ] Funnel từ events; backfill fallback = status nếu không events
- [ ] “View insights →”; optional retire `/analytics`
- [ ] Xóa kit UI chết; gỡ flags
- [ ] lint · typecheck · build

---

## N. Helper unit tests (ship với PR5)

- [ ] T01–T25 (`primary-action.spec.ts`)
- [ ] P01–P07 (`today-priority.spec.ts`)
- [ ] Floor-seconds compare interviewAt
- [ ] API flags — không N+1 trên Today/Jobs

---

## O. Post-v2 (không chặn)

- [ ] Blank CV khi editor xong
- [ ] interviewTz picker (nếu cần)
- [ ] Follow-up reminder applied lâu (v2.1)
- [ ] InterviewRound entity (nếu insight cần)
- [ ] Snapshot CV full (nếu cần detach)
