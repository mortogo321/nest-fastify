# nest-fastify — NestJS Microservices on Fastify

[![CI](https://github.com/mortogo321/nest-fastify/actions/workflows/ci.yml/badge.svg)](https://github.com/mortogo321/nest-fastify/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](./LICENSE)
[![Node](https://img.shields.io/badge/node-26.10-blue.svg)](./server/Dockerfile)
[![Bun](https://img.shields.io/badge/bun-1.4.2-black.svg)](./server/package.json)
[![NestJS](https://img.shields.io/badge/nestjs-12-red.svg)](./server/package.json)

Production-style NestJS monorepo: 5 Fastify microservices (API gateway, auth, alert, payment, worker) with gRPC inter-service calls, RabbitMQ events, Prisma + PostgreSQL, JWT auth, and a shared `@app/common` library. Bun-first toolchain, strict TypeScript, multi-stage Docker, and CI (lint + typecheck + test + build + docker).

## Tech stack (pinned)

| Layer | Choice |
|---|---|
| Runtime | Node >=22.12 (prod image `node:26.10-alpine`), Bun 1.4.2 |
| Framework | NestJS 12.1.2, `@nestjs/platform-fastify`, Config 12, JWT 12, Swagger 12, Terminus 12 |
| HTTP | Fastify + `@fastify/cookie` 11, `cors` 11, `helmet` 13, `rate-limit` 11, `static` 10 |
| Data | PostgreSQL `postgres:17.6-alpine`, Prisma 6.19.3 |
| Messaging | RabbitMQ `rabbitmq:4.3.5-management-alpine`, gRPC (`@grpc/grpc-js` 1.14) |
| Auth | JWT + refresh cookies, Argon2 0.45.1 |
| Quality | Biome 2.5.15, TypeScript ~5.9.3 strict (`noUncheckedIndexedAccess`), Vitest 5.0.3 |

> Pins: `typescript ~5.9.3` (Nest 12 has no verified TS 7 build story); runner `ubuntu-24.04`; Actions `checkout v7`, `setup-bun v2`, `buildx v4`, `build-push v7`.

## Services

| Service | HTTP | gRPC | Description |
|---|---|---|---|
| API gateway | 8000 | — | Entry point, versioned `/api/v1`, Swagger `/docs` (dev) |
| Auth | 8001 | 5001 | JWT login/refresh, users, Google/Facebook OAuth |
| Alert | 8002 | 5003 | Event-bus notifications (email/SMS/push) |
| Payment | 8003 | 5004 | Payment processing |
| Worker | 9000 | 5005 | Priority job queue (email/report/import, retries + progress) |

Health: `GET /health`, `/health/ready`, `/health/live` on every service (Terminus, public). Docker healthchecks poll `/health`.

## Quick start

```bash
git clone git@github.com:mortogo321/nest-fastify.git
cd nest-fastify/server
bun install
cp ../.env.example .env.dev   # adjust secrets for local use
docker compose -f ../docker/compose.dev.yml up -d postgres rabbitmq
bun run prisma:migrate
bun run start:dev              # or: bun run start:dev auth
```

Open: API http://localhost:8000/api/v1, docs http://localhost:8000/docs (dev only), RabbitMQ http://localhost:15672, Mailpit http://localhost:8025.

## Scripts (server/)

```bash
bun run start:dev        # watch mode (all services)
bun run build:all        # nest build x5 + copy protos
bun run typecheck        # tsc --noEmit (strict)
bun run ci:check         # biome ci (lint+format, no writes)
bun run test             # vitest run (23 tests)
bun run test:e2e         # e2e (needs live postgres+rabbitmq)
bun run validate         # typecheck + biome check
bun run prisma:migrate   # dev migrate
```

## Docker

```bash
# dev (hot reload, bind-mount)
docker compose -f docker/compose.dev.yml up -d --build
# prod (lean node runtime, per-service CMD)
docker compose -f docker/compose.prod.yml up -d --build
docker compose -f docker/compose.dev.yml config --quiet   # validate
```

One image serves all five services (`target: development|production`); compose overrides `CMD` per service (`node dist/apps/<name>/main.js`). Prod runs as non-root `nestjs`, `NODE_ENV=production`.

## Security

Helmet (CSP in prod), CORS allowlist via `CORS_ORIGINS`, rate-limit (`RATE_LIMIT_MAX/WINDOW`, 100/min default), signed http-only JWT cookies, global `ValidationPipe` (whitelist + forbidNonWhitelisted, no error details in prod), Argon2 password hashing, public-only `/health` + `/` (global `/api` prefix + versioning otherwise).

## Verification (2026-10-02)

- `bun run typecheck` — clean (strict + `noUncheckedIndexedAccess`)
- `bun run ci:check` — clean (warnings only, no errors)
- `bun run test` — 11 files / 23 tests green (vitest 5)
- `bun run build:all` — 5 services compile + protos copied
- `docker build` (production target) — green
- `docker compose` dev + prod `config --quiet` — valid
- 0 open PRs

## Structure

```
nest-fastify/
├── server/               # build context
│   ├── apps/             # api | auth | alert | payment | worker
│   ├── libs/common/      # guards, filters, interceptors, health, grpc, rmq
│   ├── libs/proto/       # gRPC .proto definitions
│   ├── prisma/schema/    # Prisma schema
│   └── Dockerfile        # deps → development | builder → production
├── docker/
│   ├── compose.dev.yml
│   ├── compose.prod.yml
│   └── db/init.sql
├── scripts/              # legacy deploy helpers
└── .github/workflows/ci.yml
```

Worker jobs: `POST /jobs/email|report|import`, `GET /jobs`, `/jobs/stats`. Alert events: `POST /notifications/email|sms|push`, `GET /events`, `/events/stats`.

## License

MIT — see [LICENSE](./LICENSE).
