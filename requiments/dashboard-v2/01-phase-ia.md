# Phase 1 — UX diagnosis + IA (rev 2)

## Top vấn đề UX

1. Không có “đơn ứng tuyển” trong UI (Tailor history vs Prep silo)
2. Home = marketing gallery, không phải queue
3. Nav flat 7 peer = feature dump (`Sidebar.tsx`)
4. AI output Modal — không addressable
5. Hai chrome layout
6. Nhiều primary CTA / màn
7. Handoff Tailor→Prep qua sessionStorage
8. Upgrade chưa gắn workflow thống nhất

## IA chốt (rev 2 — sau review status)

```
/dashboard                         Today
/dashboard/jobs                    Jobs list (+ funnel strip)
/dashboard/jobs/new                Add job
/dashboard/jobs/from               Find-or-create (cvId, jdId)
/dashboard/jobs/[id]               Overview
/dashboard/jobs/[id]/analysis
/dashboard/jobs/[id]/documents     CV source/tailored + letter
/dashboard/jobs/[id]/prep          Prep hub + sub-nav
/dashboard/jobs/[id]/prep/practice Fullscreen (no shell)
/dashboard/cv                      CV library (giữ slug — không đổi /cvs)
/dashboard/cv/[id]
/dashboard/cv/compare
/dashboard/portfolio
/dashboard/projects                Projects (nav label — không gọi Profile)
/dashboard/settings                Account (+ Language) · Plan · Danger (user menu)
```

**Nav cấp 1:** Today · Jobs · CVs · **Projects** · Portfolio  

**Không nav cấp 1:** Job Tailor, Interview Prep, Analytics, Templates, AI Wizard, Settings  
→ Templates / Wizard = `New CV ▾` · Prep = trong Job · Settings = user menu.

## Domain mục tiêu (rev 2)

```
Application {
  id, userId
  jobDescriptionId
  sourceCvId
  tailoredCvId?
  status: saved | applied | interviewing | offer | closed   // pipeline — user-set
  interviewDate?
  title?, company?
}
// Artifact progress = derived (hasAnalysis, hasTailoredCv, hasLetter?, hasPrep)
// Primary rules + transitions: 03a-status-primary-redirects.md
```

Backfill từ nhóm `(userId, jobDescriptionId, cvId)` trên analysis / letter / tailored / prep.

## Route cũ → mới

Chi tiết đầy đủ: [03a-status-primary-redirects.md](./03a-status-primary-redirects.md).

| Cũ | Mới |
|----|-----|
| `/dashboard/job-tailor` | `/jobs` + `/jobs/new` + `/jobs/[id]/*` |
| `?cvId & jobDescriptionId` | `/jobs/from?cvId=&jdId=` find-or-create |
| `/dashboard/interview-prep/[id]` | `/jobs/[applicationId]/prep` |
| `/dashboard/cv/*` | **giữ** `/cv/*` |
| `/dashboard/projects` | **giữ** (nav Projects) |
| `/dashboard/analytics` | Jobs funnel (+ optional settings insights) |
| `/dashboard/settings` | **giữ** (user menu) |
