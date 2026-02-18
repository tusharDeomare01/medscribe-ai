# ============================================================
# Stage 1 — base: shared Node.js Alpine image
# ============================================================
FROM node:20-alpine AS base

RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# ============================================================
# Stage 2 — deps: install ALL dependencies including prisma
# ============================================================
FROM base AS deps

# Copy prisma schema first so postinstall (prisma generate) works
COPY prisma ./prisma
COPY package.json package-lock.json ./
RUN npm ci

# ============================================================
# Stage 3 — builder: build Next.js in standalone mode
# ============================================================
FROM base AS builder

WORKDIR /app

# Copy node_modules (includes prisma engines)
COPY --from=deps /app/node_modules ./node_modules

# Copy generated prisma client (created by postinstall in deps stage)
COPY --from=deps /app/src/generated ./src/generated

# Copy application source
COPY . .

# Build arg — only NEXT_PUBLIC_* is baked into client JS.
ARG NEXT_PUBLIC_APP_URL=http://localhost:3000
ENV NEXT_PUBLIC_APP_URL=${NEXT_PUBLIC_APP_URL}
ENV NEXT_TELEMETRY_DISABLED=1

# Provide a dummy DATABASE_URL so next build doesn't complain.
ENV DATABASE_URL="postgresql://build:build@localhost:5432/build"

# Enable standalone output for Docker builds
ENV DOCKER_BUILD=1

# Build Next.js in standalone mode
RUN npx next build

# ============================================================
# Stage 4 — runner: minimal production image
# ============================================================
FROM base AS runner

WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

# Non-root user for security
RUN addgroup --system --gid 1001 nodejs && \
    adduser --system --uid 1001 nextjs

# Install only prisma CLI for runtime schema sync
RUN npm install -g prisma@6.19.2

# Copy standalone server (includes bundled node_modules)
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy public assets (may be empty but Next.js expects the dir)
COPY --from=builder /app/public ./public

# Copy Prisma schema for runtime db push
COPY --from=builder /app/prisma ./prisma

# Copy entrypoint
COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

USER nextjs

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

ENTRYPOINT ["./docker-entrypoint.sh"]
