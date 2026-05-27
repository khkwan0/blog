# --- STAGE 1: Base & Dependencies ---
FROM oven/bun:alpine AS base
WORKDIR /app
COPY next/package.json next/bun.lock ./
RUN bun install --frozen-lockfile

# --- STAGE 2: Development ---
FROM base AS dev
COPY next/ .
COPY prisma ./prisma

# --- STAGE 3: Builder (production build) ---
FROM base AS builder
COPY next/ .
COPY prisma ./prisma

# Generate Prisma Client before Next build (required for /api/auth route data collection).
ENV DATABASE_URL="file:/tmp/build.db"
ENV BETTER_AUTH_SECRET="docker-build-placeholder"
ENV BETTER_AUTH_URL="http://localhost:3000"
RUN touch /tmp/build.db
RUN bunx prisma generate --config=./prisma.config.js

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# --- STAGE 4: Production Runner ---
FROM oven/bun:alpine AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/prisma.config.js ./prisma.config.js
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/@prisma/adapter-better-sqlite3 ./node_modules/@prisma/adapter-better-sqlite3

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "server.js"]
