# Resumate Backend

NestJS 11 API: auth, CV, projects, portfolio, AI, analytics, interview prep, templates, notifications.

Full product overview and setup: **[../README.md](../README.md)**.

## Scripts

```bash
npm install
cp env.example .env   # then fill secrets
npm run db:setup      # migrations + seed CV templates
npm run start:dev     # http://localhost:5001
npm run build
npm run test
npm run test:e2e
```

Useful DB helpers: `db:reset`, `db:migrate-cv`, `seed:templates`, `seed:question-bank`.

## Modules

```
src/modules/
  auth/  users/  cv/  projects/  portfolio/
  templates/  ai/  analytics/  interview-prep/  notifications/
```

## Env

See `env.example`. For local `npm run start:dev`, use **`PORT=5001`** (and `FRONTEND_URL` matching the frontend port). AI parse/prep providers: `AI_CV_PARSE_PROVIDER` / `AI_INTERVIEW_PREP_PROVIDER` (`google` | `openrouter`).

Redis (`REDIS_HOST`/`REDIS_PORT`): AI rate limit (`AiRateLimitGuard`) + portfolio HTML cache. Set `REDIS_ENABLED=false` or omit a running Redis to fail-open.

Full Redis docs (keys, guarded routes, env, local run): **[../README.md#redis](../README.md#redis)**.

## Health

```bash
curl http://localhost:5001/ai/health
```
