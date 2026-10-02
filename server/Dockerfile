# nest-fastify — multi-service NestJS API (bun-first, pinned runtimes)
# Build context: server/
#
# Targets: development (hot reload) | production (lean node runtime).
# One image serves all five microservices; compose overrides CMD per service:
#   node dist/apps/<api|auth|alert|payment|worker>/main.js
# Prisma Client is generated in the builder stage; production reuses the
# builder's node_modules wholesale so the generated client is always present.

# --- deps: install with bun ---
FROM oven/bun:1.4.2-alpine AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- development: hot reload via nest --watch ---
FROM oven/bun:1.4.2-alpine AS development
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
EXPOSE 8000 8001 8002 8003 9000
CMD ["bun", "run", "start:dev"]

# --- builder: generate Prisma Client + compile all services ---
FROM oven/bun:1.4.2-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# `prisma generate` needs DATABASE_URL only for interpolation, no DB connection.
RUN bun run prisma:generate:prod && bun run build:all

# --- production: minimal node runtime, non-root ---
FROM node:26.10-alpine AS production
WORKDIR /app
ENV NODE_ENV=production
COPY package.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001 && \
    chown -R nestjs:nodejs /app
USER nestjs
EXPOSE 8000 8001 8002 8003 9000
# Per-service healthchecks live in compose (ports differ per service).
CMD ["node", "dist/apps/api/main.js"]
