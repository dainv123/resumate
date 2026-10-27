# Phase 3 — Wireframes (rev 6)

Đồng bộ [03a](./03a-status-primary-redirects.md) rev 6 · [DECISIONS](./DECISIONS.md) · [Phase 4](./04-phase-implementation.md).

**Mobile CTA:** chỉ sticky; card **tap cả vùng** → job; text “Next: {label}”.  
**Analyze:** outline/secondary only.  
**skipTailor:** primary = Mark applied.  
**Snooze:** ẩn khỏi Today; job page có Unsnooze.  
**Sticky stack / mobile ⋯ / practice bar:** [03a §11](./03a-status-primary-redirects.md).

---

## 0. AppShell

**Nav cấp 1:** Today · Jobs · CVs · **Projects** · Portfolio  
**User menu:** Settings · Logout (Language nằm trong Settings → Account)

```
┌──────────────┬──────────────────────────────────────────┐
│ Resumate     │ [=] Breadcrumb  [Bell]         [User ▾]  │
│ Today        │ PageHeader: Title + 1 Primary            │
│ Jobs         │ Mobile page: [←] Title [⋯]               │
│ CVs          │                                          │
│ Projects     │                                          │
│ Portfolio    │                                          │
│──────────────│                                          │
│ [av] Dai · Free|Pro                                     │
└──────────────┴──────────────────────────────────────────┘
```

User ▾: Settings · Logout · Plan badge trên footer  
Bell: 5 AiJob gần nhất (7 ngày) + “View all” nếu nhiều hơn → artifact  
Loading auth · Unauth redirect · Limit tooltip · Offline Alert+Retry

---

## 1. Today — `/dashboard`

**Primary:** `getJobPrimaryAction` — desktop có thể hiện trên card; mobile **chỉ sticky**. Card luôn tap → job + “Next: …”. Không Continue ở header.

### Normal

```
┌─ Good morning, Dai ─────────────────────────────────────┐
│  Next up                                                │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Senior FE · Acme · interviewing · in 5 days        │ │
│  │ Next: Open practice   (desktop: [Open practice])   │ │
│  │ mobile: không nút trên card — chỉ sticky           │ │
│  └───────────────────────────────────────────────────┘ │
│  Up next (rows; tap mở job)                             │
│  (closed không bao giờ vào đây)                         │
└─────────────────────────────────────────────────────────┘
Sticky = primary helper
```

### All caught up

```
Không còn job eligible (action none; closed excluded).
“You’re all caught up.” [Browse jobs]
```

### Empty

```
0 CV → sticky [Upload CV]
có CV, 0 job → sticky [Add job]
```

### Interview date passed (trong card)

```
Label: “Interview passed — update status”
Primary: Update status (rule 2)
```

Loading / Error: skeletons · Alert Retry

---

## 2. Jobs list — `/dashboard/jobs`

Primary: **Add job**  
Funnel strip: dùng timestamps/history (kể closed) — không chỉ snapshot mở.

```
Funnel: saved · applied · interviewing · offer · closed
Table: Title · Company · Status · Next action · Updated · ⋯
⋯ Open · Pipeline… · Delete job
```

Empty / loading / error chuẩn · Sticky Add job

**Delete job:** confirm; không xóa master CV; tailoredCv optional cascade; prep cascade.

---

## 3. Add job — `/dashboard/jobs/new`

Primary: **Create job**  
Bỏ checkbox “go to analysis”.

```
CV * · Open CV
Status * [saved ▾]  (applied / interviewing…); nếu có interview date → gợi ý interviewing
Title — heuristic Position/Title:/Role: rồi first line; fallback Untitled; inline edit
Company optional
JD * paste
URL + Resolve → fail: Alert + paste
Interview date optional (+ time optional); **tz = profile** (không picker v1)
```

Jobs list: **không** bulk actions v2.

After create → `/jobs/[id]` Overview. Primary thường `tailor` nếu saved.  
Analyze không auto. `intent=tailor`: user bấm Tailor (quota rõ).

**Duplicate JD:** warn nếu hash description trùng Application khác (“Có job tương tự — Open / Create anyway”).

Quick tailor từ CV: PR2 → `/job-tailor?cvId=`; PR4+ → `/jobs/new?cvId=&intent=tailor`.

---

## 4. Job workspace — `/dashboard/jobs/[id]/…`

### Tabs (đủ 4, Overview đứng đầu)

`Overview | Analysis | Documents | Prep`

```
/jobs/[id]              Overview
/jobs/[id]/analysis
/jobs/[id]/documents
/jobs/[id]/prep
/jobs/[id]/prep/practice   FULLSCREEN — [← Back] · Q i/n · [Exit]; autosave
```

### Chrome

```
PageHeader: Title (job) + StatusBadge + [Primary từ helper]
            Pipeline chỉ ở header menu status ▾ (một chỗ)
Aside Progress: Tailored|skip · Prep · Letter○ · Analysis○
                — Analysis optional; không lặp pipeline/primary
                Secondary khi saved: “Use original CV” → skipTailor
```

### Trùng CTA

Nếu EmptyState CTA === header primary → **ẩn nút trong EmptyState**, chỉ copy + primary header/sticky.

### Overview

```
JD preview (rút gọn) + “Edit JD”
Next action explanation (text) — không nút thứ hai
Aside = progress artifacts
```

### Analysis / Documents

- Header primary = helper (thường Tailor khi saved) — **không** đổi thành Run analysis  
- Tab Analysis: nút Run = **outline/secondary**; running/poll qua AiJob  
- Overview saved: secondary “Run analysis” + cột Match trên Jobs list khi có score  
- Stale: badge + Re-run secondary  
- Documents: Tailor nếu primary; letter secondary; “Use original CV”

### Prep

```
Sub-nav: Overview · Gaps · Stories · Practice · Research
Empty: [date] [Create prep plan]
Practice: fullscreen — [← Back to prep] · Q i/n · [Exit]; autosave
```

### AI states

pending | running | done | failed — server AiJob; toast + bell; partial error Alert.

Loading workspace / 404 / mobile: skeleton · Back to Jobs · tabs + sticky + Progress sheet

---

## 5. CVs — `/dashboard/cv` (giữ slug)

Primary: **New CV ▾** (Upload · AI Wizard · Template; **Blank** ẩn / Coming soon đến khi editor xong)

Default filter: **Master only**.  
Tailored: hàng con `↳ for Acme` link → Application (khi có), không làm loãng list.

```
⋯ View · Edit · Rename · Quick tailor · Duplicate · Delete
Delete source: block nếu N jobs đang dùng (+ giải thích)
```

---

## 6. CV detail — `/dashboard/cv/[id]`

Primary: Edit · Secondary: Export, Quick tailor, Rename, Delete (cùng rule toàn vẹn)

---

## 7. Projects — `/dashboard/projects`

(Nav label Projects — không gọi Profile)

Primary: Add project · DataList · empty/loading/error chuẩn

---

## 8. Settings — `/dashboard/settings`

Tabs: **Account** (gồm Language) | **Plan**  
Account: profile, password, language, **Danger zone** (delete account)  
Primary: không cố định — sticky **Save** khi dirty (thay primary bar)

---

## 9. Portfolio — `/dashboard/portfolio`

Stepper: Continue đến bước cuối → **Publish**  
Published state: Preview URL · **Update** · **Unpublish**  
Empty no CV → Upload CV

---

## 10. Bridge `/dashboard/jobs/from`

Không GET create. UI: “Opening job…” → client POST find-or-create → replace `/jobs/[id]`.  
Error: không tạo được → message + link Add job.

---

## 11. Thiếu màn (đã chốt hướng)

| Màn | Hướng |
|-----|--------|
| CV editor / Wizard | Restyle sau; entry New CV ▾ |
| Practice | Fullscreen |
| Portfolio public | Ngoài shell |
| Onboarding | Today empty đủ |
| Upgrade | Tooltip disable + Plan tab + paywall race |
| Untitled title | Heuristic first line JD (reuse deriveJobTitle); placeholder “Untitled job”; AI title = optional sau |

---

## Cross-cutting

- Undo xóa: soft delete + toast 5s (PR3a)  
- Dirty leave warn: Settings, JD edit  
- a11y: tabs, practice focus, nav aria-current; StatusBadge interviewing dùng accent-foreground  
- Sidebar labels ngắn EN/VI  
- Quota: reserve pending; failed → release  
- Sticky / mobile ⋯ / practice: [03a §11](./03a-status-primary-redirects.md)  
- Limit offline/500: Alert + Retry  
- Funnel: backfill fallback note (03a §10)  
- Analytics: link “View insights →” từ funnel (PR10); giữ `/analytics` đến đó
