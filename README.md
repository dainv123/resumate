# Resumate

> Update your CV in minutes — tailor it to each job, then prep for the interview.

AI-assisted CV, portfolio, and interview prep for freelancers and job seekers. Upload a CV once, keep projects in sync, generate JD-specific versions, publish a portfolio, and run a structured interview roadmap.

---

## What it does

| Area | Capabilities |
|------|----------------|
| **CV** | Upload PDF/DOCX → AI parse → edit → version history / restore / duplicate → export PDF, Word, ATS |
| **Projects** | Add project → AI bullet points → attach / detach from CV |
| **Job Tailor** | Paste JD → tailored CV, compatibility score, cover letter |
| **Portfolio** | Template-driven public page (`/portfolio/:username`), HTML export |
| **Interview Prep** | JD + CV → PASS roadmap, curated question bank, STAR stories, mock drills, cheat-sheet PDF |
| **Extras** | Analytics dashboard, CV templates, dark mode, EN/VI UI, Google OAuth |

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15, React 19, TypeScript, Tailwind CSS 4, React Query, RHF + Zod |
| Backend | NestJS 11, TypeORM, PostgreSQL, Redis |
| AI | Google Gemini and/or OpenRouter (configurable per feature) |
| Files | AWS S3 |
| Auth | JWT + Google OAuth |
| Export | Puppeteer / React-PDF / docx |
| Ops | Docker Compose (dev/prod), deployment scripts under `deployment/` |
| Tests | Jest (backend), Playwright + Cucumber (`testing/`) |

---

## Repo layout

```
resumate/
├── frontend/          # Next.js app (landing + dashboard)
├── backend/           # NestJS API
├── deployment/        # Dev/prod scripts
├── testing/           # E2E / BDD
├── docker-compose*.yml
└── requiments/        # Product notes & historical feature docs (not always current)
```

### Backend modules

`auth` · `users` · `cv` · `projects` · `portfolio` · `templates` · `ai` · `analytics` · `interview-prep` · `notifications`

### Frontend routes (dashboard)

`/dashboard` · `/dashboard/cv` · `/dashboard/projects` · `/dashboard/job-tailor` · `/dashboard/portfolio` · `/dashboard/interview-prep` · `/dashboard/analytics` · `/dashboard/templates` · `/dashboard/settings` · `/dashboard/ai-wizard`

---

## Quick start

### Prerequisites

- Node.js 18+
- PostgreSQL
- Google AI and/or OpenRouter API key
- AWS S3 credentials (CV upload)
- Optional: Redis, Google OAuth, SMTP

### 1. Backend

```bash
cd backend
npm install
cp env.example .env
# Fill DB_*, JWT_*, AWS_*, and AI keys (see env.example)
npm run db:setup          # migrations + CV template seed
npm run start:dev         # http://localhost:5001
```

Key env (see `backend/env.example`):

```env
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_NAME=postgres

AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=us-east-1
AWS_S3_BUCKET=resumate-files

GOOGLE_AI_API_KEY=
GOOGLE_AI_MODEL=gemini-1.5-flash
OPENROUTER_API_KEY=
OPENROUTER_MODEL=google/gemini-2.5-flash
AI_CV_PARSE_PROVIDER=openrouter
AI_INTERVIEW_PREP_PROVIDER=openrouter

JWT_SECRET=
JWT_EXPIRES_IN=7d
PORT=5001
FRONTEND_URL=http://localhost:5005
```

> Nest scripts bind **5001**. Prefer `PORT=5001` over the sample `5000` in `env.example` if you run via `npm run start:dev`.

### 2. Frontend

```bash
cd frontend
npm install
# Optional: .env.local
# NEXT_PUBLIC_API_URL=http://localhost:5001
# NEXT_PUBLIC_APP_URL=http://localhost:5005
# NEXT_PUBLIC_INTERVIEW_PREP_ENABLED=true
npm run dev               # http://localhost:5005
```

### 3. Docker (optional)

```bash
docker compose -f docker-compose.dev.yml up
# Frontend :5000 · Backend :5001 · Postgres :5432
```

Or: `./deployment/start-dev.sh`

### URLs

| Service | Local (npm) | Docker / start-dev |
|---------|-------------|--------------------|
| Frontend | http://localhost:5005 | http://localhost:5000 |
| Backend | http://localhost:5001 | http://localhost:5001 |
| AI health | http://localhost:5001/ai/health | same |

---

## Plans (usage limits)

Enforced in `UsersService.checkUserLimit`:

| Feature | Free | Pro |
|---------|------|-----|
| CV uploads | 1 | Unlimited |
| Projects | 3 / period | Unlimited |
| Job tailor | 5 | Unlimited |
| Exports | 10 | Unlimited |
| Interview prep plans | 1 | Unlimited |
| Mock drills | 3 | Unlimited |

Pro also unlocks interview-prep pack features (mock scoring, cheat-sheet PDF, etc.).

---

## Main API surface

Auth: `POST /auth/register` · `POST /auth/login` · `GET /auth/google` · `GET /auth/me`

CV: upload/list/update/delete · `POST /cv/:id/tailor` · `POST /cv/:id/analyze-compatibility` · `POST /cv/:id/generate-cover-letter` · export PDF/Word/ATS · versions restore/duplicate

Projects: CRUD · `add-to-cv` / `remove-from-cv` · `regenerate-bullets`

Portfolio: `generate` · `save` · public `GET /portfolio/:username`

Interview prep: create/list · task toggles · STAR edit/regenerate · mock · cheat-sheet PDF

Analytics: `GET /analytics/stats` · timeline · exports-by-format

AI: `parse-cv` · `generate-bullets` · `tailor-cv` · `suggestions` · `extract-keywords` · `GET /ai/health`

---

## Typical user flow

1. Register / Google login → upload CV → review parsed data  
2. Add projects → AI bullets → sync into CV  
3. Paste JD → tailor + compatibility + optional cover letter → export  
4. Publish portfolio link  
5. (Pro path) Create interview prep plan → daily tasks → mock → cheat sheet  

---

## Docs map

| Doc | Role |
|-----|------|
| [requiments/idea.md](./requiments/idea.md) | Product intent (source of truth for “why”) |
| [requiments/INTERVIEW_PREP_FEATURE.md](./requiments/INTERVIEW_PREP_FEATURE.md) | Interview Prep contract & checklist |
| [requiments/JOB_TAILOR_FEATURES.md](./requiments/JOB_TAILOR_FEATURES.md) | Compatibility + cover letter |
| [deployment/README.md](./deployment/README.md) | Deploy / local scripts |
| [testing/README.md](./testing/README.md) | E2E harness |
| `requiments/*` other files | Historical notes — verify against code before trusting |

---

## Status (vs older README claims)

Already in the codebase (not “planned”):

- Interview Prep, analytics, dark mode, EN/VI i18n  
- Docker Compose + deployment scripts  
- S3 uploads, Redis config, OpenRouter provider  
- Backend Jest tests + Playwright suite under `testing/`  

Still optional / incomplete depending on env: Swagger UI, custom portfolio domain, CI polish, full production hardening.

---

## License

Private / UNLICENSED (see package manifests). Treat as internal unless you publish otherwise.
