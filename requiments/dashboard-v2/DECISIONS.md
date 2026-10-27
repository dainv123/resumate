# Quyết định sản phẩm (rev 6.1)

## Polish sau merge-ready (rev 6.1)

| Điểm | Chốt |
|------|------|
| **T22** `applied + hasPrep + no date` | Cố ý **`none`** — user tự set date/tab Prep. Không thêm primary `set_interview_date` (v2.1 nếu data cho thấy kẹt nhiều). |
| **Today rank** `tailor > mark_applied` | Cố ý — bắt đầu flow trước khi “finish apply”. Lock bằng **P07**. |
| **`mark_applied` dual** | Primary khi `skipTailor`; secondary (aside/toast) khi đã tailor / chưa skip. |
| **`interviewTz` UI** | v1: **không** picker trên Add job — lấy profile tz. Đổi tz trong Settings → Account (chỉ app **mới**). |
| **Blank CV** | Ẩn / Coming soon đến khi editor restyle xong. |
| **Bell** | 5 items + “View all” (list AiJob 7 ngày) nếu >5. |
| **Language** | Reactive qua `LanguageContext` (không full reload bắt buộc). |
| **Jobs bulk** | **Không** bulk v2. |
| **`now == interviewAt`** | So sánh **floor giây**. |
| **Funnel backfill** | Không events → 1 điểm từ `status`. Có events → **chỉ** events (bỏ inferred status). |
| **PR3a size** | Giữ 1 PR nếu estimate &lt; 1 tuần; &gt; 1 tuần thì tách schema / backfill / interview+snooze columns. |
| **`--ring`** | `#A5A6FF` — focus visible trên primary navy. |

## A3 / A6 (ổn định)

| ID | Chốt |
|----|------|
| **A3** | Analyze = phụ (không primary). Overview saved: secondary “Run analysis”; Jobs: cột Match. |
| **A3 + skipTailor** | `saved && skipTailor` → primary **`mark_applied`** (intent apply rõ). Không `none`. |
| **A6** | `interviewDate` + `interviewTime?` + `interviewTz`. Sheet Next round / Offer / Close. |
| **A6 meta** | Next round: ngày cũ → `event.meta.previousInterview*`. |
| **Snooze** | **Hide from Today** (`!snoozedActive` trong eligible). Job page vẫn tính full primary. Menu **Unsnooze**. |
| **Offer** | `decide_offer` **không snooze** (urgency). Note cố ý. |
| **Reopen** | Status trước `closed` từ events. |
| **Primary color** | Button primary = **navy** `#130F49`, không orange. Accent = urgency/interviewing only (contrast via `--accent-foreground`). Lý do: (1) orange fail WCAG làm text, (2) tone tool nghiêm, (3) orange = indicator. |
| **interviewTz** | Default = **user profile tz lúc tạo Application**; v1 không picker Add job. **Không** auto-update khi user đổi profile tz sau. |
| **Analytics** | Giữ link đến PR10; funnel strip “View insights →” (option c). Không ẩn hẳn. |
| **AI notify** | PR5: bell + 5 AiJob gần nhất (không chỉ toast). |
| **Plan badge** | User menu footer: `Name · Free\|Pro`. |
| **T17** | `interviewing + hasPrep + no date` → **`open_practice`** (status interviewing đủ cửa sổ prep). |

## Backfill / CV delete / quota (rev 5, giữ)

- Backfill: `skipTailor=true` nếu !tailored; `origin=backfill`
- Xóa CV: block chỉ `applied|interviewing|offer`
- Quota: một service; reserve @ pending; dual path đến cutover
- Funnel: backfill **không** có full events → PR10 dùng current status fallback; note UX “accurate for apps after PR3a”
