# Interview Prep Pro — Feature Doc & Checklist

**Branch:** `f/daily-scheduler`  
**Status:** PR-1 ✅ · PR-2 ✅ · PR-3 ✅ · PR-4 ✅ · PR-5 ✅ · PR-6 ✅  
**Last updated:** 2026-06-21

---

## Overview

Paste JD text → adaptive interview roadmap (PASS framework) + curated question bank + gap analysis from CV.

**Promise:** Maximize pass rate via impact-scored prep — not generic AI checklists.

---

## API Contract (PR-2)

### `POST /interview-prep`

Create a prep plan.

**Body:**
```json
{
  "jobDescription": "Senior React Engineer at...",
  "cvId": "uuid",
  "interviewDate": "2026-07-01",
  "dailyCapacityMinutes": 60,
  "language": "en"
}
```

**Response:** Full plan with `roadmap`, `questionAssignments`, `readinessScore`, `readinessBreakdown`, `gaps`.

### `GET /interview-prep`

List user's prep plans (newest first).

### `GET /interview-prep/:id`

Get plan detail with assignments.

### `PATCH /interview-prep/:id/tasks/:dayIndex/:taskId`

Mark task done/undone. Recalculates readiness.

### `PATCH /interview-prep/:id/star-stories/:storyIndex`

Edit STAR story fields and mark `ready: true`.

### `POST /interview-prep/:id/star-stories/:storyIndex/regenerate`

Regenerate one STAR story from CV + JD (AI).

### `POST /interview-prep/:id/mock`

Submit mock answer for rubric-based evaluation.

**Body:**
```json
{
  "assignmentId": "uuid",
  "answer": "My answer text..."
}
```

**Response:** Plan + `mockEvaluation` `{ score, matchedCriteria, missingCriteria, feedback }`

### `GET /interview-prep/:id/export/cheat-sheet/pdf`

Download PDF cheat sheet (STAR stories, questions, project defense, final days roadmap).

---

## Architecture (PR-3)

```
InterviewPrepController
  └── InterviewPrepService (orchestrator)
        ├── ImpactScoringService
        ├── QuestionSelectorService
        ├── DailySchedulerService
        ├── ReadinessService
        ├── SpacedRepetitionService
        ├── CheatSheetExportService
        ├── InterviewPrepAnalyticsService
        ├── InterviewPrepReminderTask
        ├── NotificationsService
        ├── AiService.inferInterviewProcess
        ├── AiService.generateStarStories
        ├── AiService.generateProjectDefenseSheets
        ├── AiService.evaluateMockAnswer
        ├── AiService.analyzeCompatibility
        ├── CvService.getCvById
        └── JobDescription (repo)
```

---

## Master Checklist

### PR-1: Foundation — DB + Domain + KB seed ✅

#### Backend
- [x] `QuestionBank` entity
- [x] `InterviewPrepPlan` entity
- [x] `InterviewQuestionAssignment` entity
- [x] Migration `CreateInterviewPrepTables`
- [x] Extend `JobDescription`: `sourceUrl`, `sourceType`, `parsedMetadata`
- [x] Extend `UserUsage`: `interviewPrepPlans`, `mockDrills`
- [x] Seed `question-bank.seed.json` — 50 câu MVP
- [x] `pass-framework.ts` — enums, types, impact formula
- [x] `impact-scoring.service.ts` + unit tests
- [x] `daily-scheduler.service.ts` + unit tests
- [x] `question-bank-seeder.service.ts` — auto-seed on startup
- [x] `InterviewPrepModule` registered in `app.module.ts`
- [x] `nest-cli.json` — copy seed JSON to dist

#### Deliverable
- [x] Scheduler builds adaptive timeline (pure logic, no API yet)

---

### PR-2: Core API + Scheduler + Impact scoring ✅

#### Backend
- [x] `ImpactScoringService.scoreGaps` (from PR-1)
- [x] `QuestionSelectorService.selectFromBank`
- [x] `DailySchedulerService.buildRoadmap` (from PR-1)
- [x] `ReadinessService.calculate`
- [x] `InterviewPrepService.createPlan`
- [x] `InterviewPrepService.getPlan` / `listPlans`
- [x] `InterviewPrepService.updateTaskStatus`
- [x] DTOs + validation
- [x] Controller endpoints (POST, GET list, GET :id, PATCH task)
- [x] Register controller in module; import CvModule, AiModule, UsersModule
- [x] Rate limit hook (`checkUserLimit('interviewPrepPlans')`)
- [x] Integration test: create plan happy path

#### Deliverable
- [x] API tạo plan từ JD text + CV id

---

### PR-3: AI layer — Process map + STAR + Project Defense ✅

- [x] `inferInterviewProcess` prompt (`ai/prompts/interview-prep.prompts.ts`)
- [x] `generateStarStories` prompt
- [x] `generateProjectDefense` prompt
- [x] `evaluateMockAnswer` prompt
- [x] Wire AI into `createPlan` (parallel AI calls)
- [x] STAR edit + mark Ready endpoints
- [x] STAR regenerate endpoint
- [x] Mock answer endpoint with rubric scoring
- [x] `starStories` + `projectDefenses` on plan entity
- [x] Readiness uses STAR `ready` flags

---

### PR-4: Frontend — Pages + Timeline UI ✅

- [x] Sidebar nav `interviewPrep`
- [x] `/dashboard/interview-prep` list + create form
- [x] `/dashboard/interview-prep/[id]` detail (timeline, readiness, STAR, questions, defense)
- [x] i18n EN/VI (`interviewPrep.*`)
- [x] Job Tailor CTA → prefill via sessionStorage
- [x] `frontend/src/lib/interview-prep.ts` API client

---

### PR-5: Mock Drill + Readiness Gate + Freemium ✅

- [x] `POST /interview-prep/:id/mock` (wired in PR-3, paywall in PR-5)
- [x] `SpacedRepetitionService` — retry weak questions on D-2/D-1 (score < 7)
- [x] Wire spaced repetition into `submitMockAnswer`
- [x] Free plan question gating (5 visible) + `limits` in API response
- [x] `readinessGate` object in API response (`threshold`, `pointsToGo`, `nextActions`)
- [x] Enable `checkUserLimit` enforcement (`interviewPrepPlans`, `mockDrills`)
- [x] `ProUpgradeModal` + locked questions UI
- [x] Readiness gate banner on detail page
- [x] Handle 400 paywall errors on create plan / mock submit
- [x] i18n `interviewPrep.proUpgrade.*`, `readinessGate.*`

---

### PR-6: Polish + Export + Notifications ✅

- [x] `CheatSheetExportService` — HTML → PDF via Puppeteer
- [x] `GET /interview-prep/:id/export/cheat-sheet/pdf`
- [x] Frontend download cheat sheet button
- [x] `NotificationsService` + daily reminder cron (`InterviewPrepReminderTask` @ 8AM)
- [x] `lastReminderDate` on plan entity + migration
- [x] `InterviewPrepAnalyticsService` — structured events (plan, task, mock, export, reminder)
- [x] Playwright smoke test `testing/tests/smoke/interview-prep.spec.ts`

---

## External MIT supplements

Do **not** replace curated core. Import adds FAQGURU + Data/ML packs:

```bash
cd backend && npm run import:external-question-banks
```

Seeds: `question-bank-external-faqguru.seed.json`, `question-bank-external-mlds.seed.json`  
Sources: `external:faqguru`, `external:mlds-ajit`, `external:mlds-kaggle`  
See `data/EXTERNAL_ATTRIBUTION.md`. Note: HF/Kaggle CSV is low-diversity (~20 unique after dedupe); Ajit repo is the main Data pack.

---

## Question Bank (400 curated)

| Batch | Count | Status |
|-------|-------|--------|
| MVP seed (`question-bank.seed.json`) | 50 | [x] |
| Phase 2 pack (`question-bank-p2.seed.json`) | 40 | [x] |
| Expansion (`question-bank-expansion.seed.json`) | 310 | [x] |
| **Total** | **400** | [x] |

### Expansion breakdown (310)

| Category | Count |
|----------|-------|
| Behavioral | 52 |
| Frontend technical | 44 |
| Backend technical | 44 |
| System design | 44 |
| FAANG pack | 24 |
| Product manager | 24 |
| Data science/analyst | 24 |
| DevOps/SRE | 14 |
| Mobile | 12 |
| Security | 10 |
| Vietnam HR screen | 10 |
| QA | 8 |

Regenerate expansion file: `npm run seed:question-bank` (backend). Seeder upserts `p2` + `expansion` on startup.

AI-enrich rubric/outline/follow-ups for template entries:

```bash
cd backend
npm run enrich:question-bank -- --dry-run          # preview count
npm run enrich:question-bank -- --limit 10         # test batch
npm run enrich:question-bank                         # all template entries (~350)
npm run enrich:question-bank -- --file question-bank-expansion.seed.json
```

Requires `GOOGLE_AI_API_KEY`. Sets `source: ai-enriched` on updated rows. MVP seed (50) is skipped unless rubric still uses template markers.

---

## PASS Framework (roadmap phases)

| Phase | Theme | When |
|-------|-------|------|
| **P** | Parse — interview process map | Day 1 |
| **A** | Assess — gap study (impact P1 first) | Early days |
| **S** | Stories — STAR + project defense | Mid |
| **S** | Simulate — mock drills | D-3..D-2 |
| **P** | Polish — day before + interview day | D-1, D-0 |

---

## Readiness formula

```
Readiness =
  compatibility × 0.30 +
  questionCoverage × 0.25 +
  starReadiness × 0.20 +
  companyResearch × 0.15 +
  mockPerformance × 0.10
```

Gate threshold: **75**

---

## Freemium limits (configured, enforcement PR-5)

| Feature | Free | Pro |
|---------|------|-----|
| Plans/month | 1 | unlimited |
| Mock drills | 0 | unlimited |
| Visible questions | 5 | all |
| Cheat sheet PDF | ❌ | ✅ |

---

## Launch checklist

- [x] Feature flag `INTERVIEW_PREP_ENABLED` (backend guard; default `true`, set `false` to disable)
- [x] Feature flag `NEXT_PUBLIC_INTERVIEW_PREP_ENABLED` (frontend; set `false` to hide UI)
- [x] Migrations in repo — run on staging before launch:
  - `1761500000000-CreateInterviewPrepTables`
  - `1761500000001-AddInterviewPrepAiContent`
  - `1761500000002-AddInterviewPrepReminderDate`
- [x] Rate limits enforced (`interviewPrepPlans`, `mockDrills`)
- [x] AI cost estimate: **~$0.10–0.15 / plan** (4 parallel Gemini calls on create)
- [x] Error monitoring via existing global exception filter
- [x] Dashboard quick-action card + landing page feature mention
- [x] Cheat sheet export gated to Pro
- [x] Pro upgrade modal (`/dashboard/settings` CTA)

### Env vars (launch)

```env
# Backend
INTERVIEW_PREP_ENABLED=true
EMAIL_USER=...          # optional — daily prep reminders
EMAIL_PASSWORD=...
FRONTEND_URL=https://app.resumate.example

# Frontend (build-time)
NEXT_PUBLIC_INTERVIEW_PREP_ENABLED=true
```

### Pre-launch (manual)

- [ ] Run migrations on staging DB
- [ ] Smoke test: create plan → task → mock (Pro) → export PDF (Pro)
- [ ] Set `INTERVIEW_PREP_ENABLED=false` rollback path verified

---

## Phase 2 backlog (post-v1)

- [x] JD URL resolver (Greenhouse, Lever, ITviec + generic HTML)
- [x] Company research AI brief + checklist UI
- [x] Global JD paste bar (dashboard navbar)
- [x] KB expansion +40 (PM/Data/FAANG) — target 400 in follow-up
- [x] FAANG pack upsell (Pro-gated question pack)
- [x] Post-interview survey → analytics event
- [ ] Voice mock
- [ ] Stripe payment
- [x] KB full 400 câu + role packs (PM/Data/FAANG/DevOps/Mobile/Security/QA)
- [ ] Survey-driven readiness weight tuning
