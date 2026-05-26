# Forms Builder App — Agent Guide

## Quick start

```sh
cp .env.example .env          # first setup only
docker compose up -d          # PostgreSQL on :5432
pnpm install
pnpm db:migrate               # runs drizzle-kit migrate
pnpm dev                      # starts web (:3000) + api (:8000)
```

## Monorepo structure

- `apps/web` — Next.js 16 app (Win98-themed form builder UI)
- `apps/api` — Express server, serves OpenAPI REST (`/api`) + tRPC (`/trpc`)
- `packages/database` — Drizzle ORM + PostgreSQL schema & migrations
- `packages/trpc` — tRPC router definitions (server) + client type exports
- `packages/services` — Business logic (form CRUD, auth, submissions)
- `packages/logger` — winston logger

All internal packages are `@repo/*` (workspace protocol).

## Commands

| Intent | Command |
|---|---|
| Dev (both apps) | `pnpm dev` |
| Build all | `pnpm build` |
| Lint | `pnpm lint` |
| Typecheck | `pnpm check-types` |
| Format | `pnpm format` |
| DB migration | `pnpm db:migrate` |
| DB codegen | `pnpm db:generate` |
| Single app dev | `pnpm --filter web dev` or `pnpm --filter @repo/api dev` |

Root commands use `dotenv -- turbo ...` — env vars loaded from root `.env`.

## Architecture

- **Auth**: JWT in cookies, verified in tRPC context. `authenticatedProcedure` checks `ctx.user`.
- **API entry**: `apps/api/src/index.ts` → Express app on `PORT` (default 8000).
- **DB schema**: `packages/database/schema.ts` re-exports models. Migrations in `packages/database/drizzle/`.
- **tRPC routes** (all in `packages/trpc/server/routes/`): `health`, `auth`, `form`.
- **Form features**: Drag-and-drop builder (`@dnd-kit`), Win98-styled windows (`react-rnd`), form preview & public submission.
- **AI assistant**: Clippy component (`apps/web/components/clippy.tsx`) uses `POST /api/ai/generate-form` → `z-ai-web-dev-sdk` with `.z-ai-config`.

## Environment

Root `.env` is symlinked into each app/package by `setup.sh`. `.env.example` has all vars with defaults.

Key vars:

```
DATABASE_URL=postgres://postgres:postgres@localhost:5432/dev
JWT_SECRET=<your-secret>
ZAI_BASE_URL=...
ZAI_API_KEY=...
ZAI_MODEL=GLM-4.5-air
CORS_ORIGIN=http://localhost:3000    # comma-separated for multiple origins
APP_NAME=FormsBuilder
COOKIE_SECURE=true                    # set true for HTTPS
COOKIE_DOMAIN=.yourdomain.com
AUTH_COOKIE_NAME=accessToken
SESSION_DURATION_MS=31536000000
```

Web app also reads `NEXT_PUBLIC_API_URL` (client-side). Skip env validation with `SKIP_ENV_VALIDATION=true`.

`NODE_ENV=prod` is used across the stack to toggle secure cookies, CORS, and logging behavior. Do NOT set it to `"production"` — the schema expects `"prod"`.

## Route groups (Next.js)

- `(desktop)` — Authenticated pages (builder, forms, music-player, auth forms)
- `(public)` — Public-facing form submission pages

Clippy is rendered in the root layout (visible everywhere).

## Notable conventions

- Prettier: 100 print width, trailing commas, double quotes, semicolons.
- `eslint --max-warnings 0` in web app (zero tolerance).
- `next typegen && tsc --noEmit` for web typechecking.
- `tsup` bundles the API server (`apps/api/tsup.config.ts`), single entry `./src/index.ts`, output `./dist`.
- Drizzle dialect is PostgreSQL, schema in `packages/database/schema.ts`.
- No test suite is configured.

## DB workflow

1. Edit models in `packages/database/models/*.ts`
2. Run `pnpm db:generate` — produces migration in `packages/database/drizzle/`
3. Run `pnpm db:migrate` — applies migration to running PostgreSQL
