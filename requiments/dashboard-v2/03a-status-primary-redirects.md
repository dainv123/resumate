# Status · Primary · Redirects · PR (rev 6.1)

Spec canonical. Quyết định: [DECISIONS.md](./DECISIONS.md).

---

## 1. Model

```
status: saved | applied | interviewing | offer | closed
closedReason?: rejected | withdrawn | accepted | other
skipTailor: boolean
origin?: 'user' | 'backfill'
interviewDate: date | null
interviewTime: time | null
interviewTz: string                 // set at create from user profile tz; no Add-job picker v1; never auto-migrate on profile change
snoozedUntil?: timestamptz | null
sourceCvId?, tailoredCvId?, jobDescriptionId
deletedAt?
```

**SSOT PV:** Application. Prep đọc từ Application sau migrate.

### `interviewPassed(app, now, tz)`

Dùng `app.interviewTz` (fallback `ctx.tz`).  
No date → false.  
No time → passed iff local **date &lt; today**.  
With time → passed iff local datetime &lt; now (compare **floor to seconds**).  
`now == interviewAt` (cùng giây) → **not** passed.

### Flags API (list)

`hasAnalysis`, `hasTailoredCv`, `hasLetter`, `hasPrep`, `matchScore?`

### Stale

Hash JD + skills + experience; badge + secondary only.

### Events

Table append-only. First-reach: `appliedAt`, `interviewingAt`, `offerAt`, `closedAt`.  
Next round meta: `previousInterviewDate|Time|Tz`.

---

## 2. `getJobPrimaryAction(app, ctx: { now, tz })`

| # | Điều kiện | action | Today eligible? |
|---|-----------|--------|-----------------|
| 1 | `closed` | `reopen` | **No** |
| 2 | `offer` | `decide_offer` | Yes (**no snooze**) |
| 3 | `interviewPassed` && status ∈ {saved, applied, interviewing} && !snoozedActive | `update_status` | Yes* |
| 4 | status ∈ {saved, applied, interviewing} && (status===interviewing \|\| interviewUpcoming) && !hasPrep | `create_prep` | Yes* |
| 5 | (status===interviewing \|\| interviewUpcoming) && hasPrep | `open_practice` | Yes* |
| 6 | `saved` && !hasTailoredCv && !skipTailor | `tailor` | Yes* |
| **6b** | `saved` && `skipTailor` | **`mark_applied`** | Yes* |
| 7 | else | `none` | No |

\*Today additionally requires `!snoozedActive && !deletedAt` (xem §3).  
`snoozedActive` = `snoozedUntil != null && snoozedUntil > now`.

### Snooze semantics (**chốt: hide from Today**)

| | |
|--|--|
| Today `eligible` | `action ∉ {none, reopen}` && `!snoozedActive` && `!deletedAt` |
| Job page | Gọi helper **không** filter snooze → user vẫn thấy primary thật (vd. tailor) + menu **Unsnooze** |
| Offer | Không snooze (`decide_offer` luôn eligible nếu offer) |
| Unsnooze | `⋯ → Unsnooze` hoặc clear `snoozedUntil` khi explicit unsnooze (không auto khi mở page — tránh vô tình; chỉ menu) |

**Mental model:** “Snooze = tạm ẩn khỏi Today”, không phải “chỉ tắt một rule”.

### Secondary (không primary)

- Analyze: Overview outline (saved) + tab Analysis outline; Jobs Match column  
- **`mark_applied` xuất hiện 2 nơi:** (1) **primary** khi `skipTailor` (rule 6b); (2) **secondary** aside / toast sau tailor khi `!skipTailor`  
- Letter, Re-run stale  
- Reopen: job page / menu only  

### Sheets

**update_status:** Next round (meta previous dates) · Offer · Close(+reason) · Snooze(1d/3d/1w)  
**applied+passed:** Set interviewing+date · Close · Snooze  
**decide_offer:** Accept → closed+accepted · Decline → closed+rejected  

**Reopen:** previous status from events (fallback saved).

### AI primary actions

`tailor` / analyze-secondary: start AiJob tại chỗ; poll.

---

## 3. Today: `getJobTodayPriority(app, ctx)`

```
eligible = action ∉ {none, reopen} && !snoozedActive && !deletedAt
sort:
  1. interviewUpcoming soonest (nulls last)
  2. action rank: decide_offer > update_status > create_prep > open_practice > tailor > mark_applied
  3. updatedAt desc
```

Empty → All caught up.

Mobile: sticky only; card entire tap → job; text “Next: {label}”.

---

## 4. Tests

### `getJobPrimaryAction` T01–T25

| ID | Setup | Expect |
|----|-------|--------|
| T01 | closed | reopen; not Today |
| T02 | offer | decide_offer |
| T03 | interviewing, date yesterday | update_status |
| T04 | applied, date yesterday, !prep | update_status |
| T05 | saved, date yesterday, !tailored | update_status |
| T06 | interviewing, tomorrow, !prep | create_prep |
| T07 | interviewing, tomorrow, hasPrep | open_practice |
| T08 | saved, next week, !prep | create_prep |
| T09 | offer + future date | decide_offer |
| T10 | applied, !tailored, no date | none |
| T11 | saved, !tailored, !skip | tailor |
| **T12** | saved, skipTailor | **mark_applied** |
| T12b | saved, skipTailor, hasPrep, no date | mark_applied |
| T13a | interviewing, today 15:00, now 10:00, !prep | create_prep |
| T13b | same + hasPrep | open_practice |
| T14 | now == interviewAt | not passed → prep/practice by hasPrep |
| T15a | date-only today, tz UTC before local midnight edge | document fixture |
| T15b | same calendar, Asia/Ho_Chi_Minh after/before midnight | assert passed bit |
| T16 | backfill skipTailor, saved, no date | mark_applied |
| **T17** | interviewing, hasPrep, **no date** | **open_practice** |
| T18 | would-be update_status + snoozed | update_status vẫn trả về từ helper; Today excludes (P05) |
| T19 | saved, stale, !tailored | tailor |
| T20 | applied + yesterday + hasPrep | update_status |
| T21 | saved + yesterday + snoozed — helper alone | update_status (snooze không đổi action) |
| T22 | applied + hasPrep + no date | **none** (cố ý — DECISIONS) |
| T22b | same fixtures, document product intent | none; user opens Prep / sets date manually |
| T23 | offer + snoozedUntil set | decide_offer (Today vẫn hiện — P06) |
| T24 | (covered by T15a/b) | |
| T25 | from duplicate unique | UI “Already exists” → Open |

### Today priority

| ID | Expect |
|----|--------|
| P01 | sooner interview first |
| P02 | same date: update_status before create_prep |
| P03 | deletedAt excluded |
| P04 | only closed → All caught up |
| **P05** | snoozedActive excluded from Today even if action=tailor/update_status |
| P06 | offer always in Today even if snoozedUntil set |
| **P07** | one job `tailor` + one `mark_applied` → **tailor** sorts before mark_applied |

---

## 5. Backfill (PR3a)

- `origin=backfill`  
- !tailoredCvId → `skipTailor=true`  
- Copy interview* từ prep; infer status nhẹ  
- **Không** tạo đủ status events lịch sử → funnel fallback (xem §10)  
- Orphan audit trước; re-backfill/dual-write tại PR4 cutover  

---

## 6. Xóa CV

Block nếu còn job `applied|interviewing|offer`.  
`saved`/`closed`: warn + cho xóa → `sourceCvMissing`. Soft delete + Undo.

---

## 7. Quota + dual path

Một QuotaService. Reserve @ **pending**. Commit done / release fail.  
Đường cũ + AiJob cùng service đến cutover. Dual-write applicationId.

---

## 8. AiJob

Types: analyze | tailor | letter | prep.  
Unique active (applicationId, type). Timeout → failed + release.  
**Notify:** persist for bell (7 days).

---

## 9. `/jobs/from`

POST + partial unique. Unique violation → UI “Already exists” + Open. Bridge no GET create.

---

## 10. Funnel (PR10)

Ever-reached via events.

- **No events** (typical backfill): single data point = current `status`.  
- **Has events:** count from **events only** (ignore inferred/current for funnel stages).  
- UI copy: funnel most accurate for apps created after PR3a.

---

## 11. Sticky stack (mobile)

z-index bottom → top:

1. Content (+ `padding-bottom` = sticky height + `env(safe-area-inset-bottom)`)  
2. Sticky primary bar  
3. Sticky Save dirty (**thay** primary nếu cùng lúc)  
4. Toast / Dialog  

Không FAB. Không hai primary sticky.

### Mobile header pattern

`[←] Title [⋯]` — `⋯` sheet: secondary + Pipeline + Unsnooze + Delete.

### Practice fullscreen

Top: `[← Back to prep] · Q i/n · [Exit]`. Autosave prep plan.

---

## 12. Redirect (from PR)

| Cũ | Mới | From PR |
|----|-----|---------|
| `/cv/*` | giữ | — |
| `/job-tailor` | `/jobs` | PR4 |
| deep-link cv+jd | bridge POST | PR4 |
| `/interview-prep` | `/jobs` | PR7 |
| `/interview-prep/[id]` | prep route / fallback | PR7 |
| `/projects` | giữ | PR8 |
| `/analytics` | giữ → funnel link PR10 | — |
| `/settings` | giữ | — |

---

## 13. PR order

| PR | Scope |
|----|-------|
| **PR1** | Tokens (**incl. accent-foreground**) + PageHeader + EmptyState + sticky §11 — nav cũ |
| **PR2** | CV restyle; New CV; Quick tailor → job-tailor; Master filter |
| **PR3a** | Schema Application + events + soft delete + partial unique + interview date/time/tz + skipTailor/origin/snooze + **orphan audit + backfill** (§1 model + §5) |
| **PR3b** | AiJob + shared quota reserve + POST from + dual-write |
| **PR4** | Jobs + Add job + bridge; nav Jobs; cutover |
| **PR5** | Workspace + helper tests + AiJob poll + **bell** + Match column + secondary analyze |
| **PR6** | Today + priority + All caught up |
| **PR7** | Prep + practice fullscreen exit bar |
| **PR8** | Nav Projects; Settings; Plan badge; giữ Analytics |
| **PR9** | Portfolio |
| **PR10** | Funnel + insights link; cleanup |

Chi tiết: [04-phase-implementation.md](./04-phase-implementation.md).
