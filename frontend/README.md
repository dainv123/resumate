# Resumate Frontend

Next.js 15 (App Router) + React 19 + Tailwind CSS 4. Landing page, auth, and dashboard for CV / projects / job tailor / portfolio / interview prep / analytics.

Full product overview and setup: **[../README.md](../README.md)**.

## Scripts

```bash
npm install
npm run dev          # http://localhost:5005 (Turbopack)
npm run build
npm start            # http://localhost:5000
npm run lint
npm run type-check
```

## Env (optional `.env.development`)

```env
NEXT_PUBLIC_API_URL=http://localhost:5001
NEXT_PUBLIC_APP_URL=http://localhost:5005
NEXT_PUBLIC_INTERVIEW_PREP_ENABLED=true
NEXT_PUBLIC_GOOGLE_CLIENT_ID=
NEXT_PUBLIC_GOOGLE_ANALYTICS_ID=
```

API client defaults to `http://localhost:5001` when `NEXT_PUBLIC_API_URL` is unset (`src/lib/api.ts`).

## Structure

```
src/
├── app/                 # Routes: landing, auth, dashboard/*
├── components/          # UI + feature components
├── contexts/            # Auth, language, theme, toast
├── locales/             # en.json, vi.json
└── lib/                 # API client, feature flags, utils
```
