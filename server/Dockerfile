# ============================================
# Stage 1: Base - Common dependencies
# ============================================
FROM node:20-alpine AS base

# Install system dependencies
RUN apk update && \
    apk add --no-cache \
    libc6-compat \
    openssl \
    netcat-openbsd \
    && rm -rf /var/cache/apk/*

# Install pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Install global tools
RUN pnpm add -g @nestjs/cli@^10.4.8 @dotenvx/dotenvx

# Set working directory
WORKDIR /app

# ============================================
# Stage 2: Dependencies - Install all dependencies
# ============================================
FROM base AS dependencies

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install all dependencies (including dev dependencies for build)
RUN pnpm install --frozen-lockfile

# ============================================
# Stage 3: Builder - Build the application
# ============================================
FROM base AS builder

# Copy dependencies from previous stage
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Generate Prisma Client
RUN pnpm prisma:prod generate

# Build the application
RUN pnpm build

# ============================================
# Stage 4: Production Dependencies - Install only production dependencies
# ============================================
FROM base AS production-dependencies

# Copy package files
COPY package.json pnpm-lock.yaml ./

# Install only production dependencies
RUN pnpm install --frozen-lockfile --prod && \
    pnpm store prune

# ============================================
# Stage 5: Development - For local development with hot reload
# ============================================
FROM base AS development

# Copy dependencies
COPY --from=dependencies /app/node_modules ./node_modules

# Copy source code
COPY . .

# Expose ports for all services
EXPOSE 3000 3001 3002 3003 3004

# Set entrypoint
ENTRYPOINT ["sh", "scripts/docker-entrypoint.dev.sh"]

CMD ["pnpm", "start:dev"]

# ============================================
# Stage 6: Production - Optimized production image
# ============================================
FROM base AS production

# Set NODE_ENV
ENV NODE_ENV=production

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && \
    adduser -S nestjs -u 1001

# Copy production dependencies
COPY --from=production-dependencies --chown=nestjs:nodejs /app/node_modules ./node_modules

# Copy built application
COPY --from=builder --chown=nestjs:nodejs /app/dist ./dist

# Copy necessary files for runtime
COPY --from=builder --chown=nestjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nestjs:nodejs /app/scripts ./scripts
COPY --from=builder --chown=nestjs:nodejs /app/package.json ./package.json
COPY --from=builder --chown=nestjs:nodejs /app/.env.* ./

# Generate Prisma Client in production
RUN pnpm prisma:prod generate

# Switch to non-root user
USER nestjs

# Expose ports for all services
EXPOSE 3000 3001 3002 3003 3004

# Health check
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
    CMD node -e "require('http').get('http://localhost:3000/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

# Set entrypoint
ENTRYPOINT ["sh", "scripts/docker-entrypoint.prod.sh"]

CMD ["node", "dist/apps/api/main"]
