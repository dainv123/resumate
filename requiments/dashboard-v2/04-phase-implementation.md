# Phase 4 — Implementation plan (rev 6.1)

Mỗi PR độc lập ship được. Spec helper/tests: [03a](./03a-status-primary-redirects.md) rev 6.1.

**Ready for `go PR1`.** Polish 6.1: P07, T22/T22b, `--ring`, funnel events-only, Blank ẩn, no Jobs bulk.

---

## PR1 — Shell chrome (không đổi nav)

**Mục tiêu:** Token + PageHeader + EmptyState + sticky CTA convention trên layout hiện tại.

| | |
|--|--|
| **Sửa** | `globals.css` + shadcn init; **`--accent-foreground`**; StatusBadge interviewing pattern; `PageHeader`, `EmptyState`; sticky padding §11; Plan badge trong user menu footer (có thể ship sớm) |
| **Không** | Đổi Sidebar items route; Application; Jobs |
| **Test** | Contrast accent-foreground; lint/typecheck/build |
| **Rollback** | Revert PR |

---

## PR2 — CV restyle

| | |
|--|--|
| **Sửa** | `/dashboard/cv`, detail; `New CV ▾`; filter Master; tailored `↳`; Quick tailor → `/job-tailor?cvId=` |
| **Xóa CV** | UI warn theo rule tạm (job active) nếu API chưa có — hoặc chờ PR3a |
| **Test** | List/filter/upload; không 404 wizard entry |
| **Rollback** | Revert |

---

## PR3a — Application schema + backfill

| | |
|--|--|
| **BE** | Entity Application; migration: status, skipTailor, origin, interviewDate/Time/Tz, snoozedUntil, soft delete, partial unique, `application_status_events`, first-reach timestamps; orphan audit script. Nếu estimate &gt; 1 tuần: tách schema / backfill / interview+snooze columns |
| **Backfill** | skipTailor=true nếu !tailored; origin=backfill; copy date từ prep; infer status nhẹ; **không** fake full events |
| **API** | CRUD Application tối thiểu; list trả **flags** artifact + matchScore |
| **Xóa CV** | Enforce block applied\|interviewing\|offer |
| **Không** | AiJob UI; đổi nav |
| **Test** | Migration fresh+existing; backfill idempotent; unique partial; unit date passed TZ |
| **Rollback** | Migration down; feature flag ignore Application table |

---

## PR3b — AiJob + quota + from

| | |
|--|--|
| **BE** | AiJob entity/lifecycle; QuotaService reserve@pending / commit@done / release@fail; **wire đường cũ** tailor/analyze/letter qua cùng QuotaService; POST `/applications/from`; dual-write applicationId lên analysis/letter mới |
| **FE** | Bridge page `/jobs/from` (POST then replace) — có thể ship disabled đến PR4 |
| **Test** | Race double-click; reserve/release; from upsert; quota shared với endpoint cũ |
| **Rollback** | Flag tắt AiJob path; cũ giữ commit sync |

---

## PR4 — Jobs list + Add job + cutover Tailor

| | |
|--|--|
| **FE** | `/jobs`, `/jobs/new` (status picker, title heuristic); redirect `/job-tailor` → jobs; bridge from; nav bật Jobs, ẩn Job Tailor |
| **BE** | Re-backfill delta cutover |
| **Prep** | Link tạm `/interview-prep` |
| **Test** | Create job; deep-link cũ; Quick tailor → new flow |
| **Rollback** | Flag: hiện lại Job Tailor nav; tắt redirect |

---

## PR5 — Job workspace

| | |
|--|--|
| **FE** | Workspace Overview\|Analysis\|Documents; helper T01–T25 + priority P01–P06; secondary Analyze; Match column; poll AiJob; **notification bell**; mobile `[←] Title [⋯]`; Unsnooze; empty CTA không trùng primary |
| **Không** | Prep sub-routes (placeholder link) |
| **Test** | Helper unit incl. T12 mark_applied, T17 open_practice, P05 snooze; AiJob bell |
| **Rollback** | Revert workspace routes; list vẫn OK |

---

## PR6 — Today

| | |
|--|--|
| **FE** | Replace home gallery; Next up + priority P01–P04; All caught up; mobile sticky-only; card tap + “Next:” |
| **Test** | Empty 0 CV / 0 job / caught up; sort |
| **Rollback** | Flag old dashboard home |

---

## PR7 — Prep

| | |
|--|--|
| **FE/BE** | `/jobs/[id]/prep/*`; practice fullscreen **exit bar** (Back · Qi/n · Exit) + autosave; redirect interview-prep; SSOT interview fields |
| **Test** | Create prep; snooze/unsnooze; practice exit |
| **Rollback** | Keep old prep routes parallel |

---

## PR8 — Projects nav + Settings

| | |
|--|--|
| **FE** | Sidebar: Projects (path `/projects` giữ); Settings Account+Language+Danger+Plan; **giữ** Analytics nav/link |
| **Rollback** | Revert sidebar |

---

## PR9 — Portfolio

Continue → Publish; Update/Unpublish published state.

---

## PR10 — Funnel + cleanup

Jobs funnel từ events; **backfill fallback = current status** (document in UI); link “View insights →”; optional retire `/analytics`; xóa kit chết; gỡ flags.

---

## Shared FE module (PR5+)

```
frontend/src/lib/jobs/primary-action.ts
frontend/src/lib/jobs/primary-action.spec.ts
frontend/src/lib/jobs/today-priority.ts
frontend/src/lib/jobs/today-priority.spec.ts
frontend/src/lib/jobs/interview-time.ts  // passed/upcoming
```

API list Application **phải** trả flags — FE helper không N+1.

---

## Definition of done mỗi PR

- [ ] lint + typecheck + build FE (và BE test nếu đụng)
- [ ] Không 404 deep-link trong phạm vi “from PR” cột redirect
- [ ] Rollback path ghi trong PR description
- [ ] Không mở rộng scope sang PR sau
