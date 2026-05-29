# --- STAGE 1: Base & Dependencies ---
FROM oven/bun:alpine AS base
WORKDIR /app
RUN apk add --no-cache ffmpeg python3 py3-pip nodejs deno \
  && pip3 install --break-system-packages "yt-dlp[default]"
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

ENV DATABASE_URL="postgresql://blog:blog@postgres:5432/blog_prod"
ENV BETTER_AUTH_URL="http://localhost:3000"
RUN bunx prisma generate --config=./prisma.config.js

ENV NEXT_TELEMETRY_DISABLED=1
RUN bun run build

# --- STAGE 4: Production Runner ---
FROM oven/bun:alpine AS runner
WORKDIR /app

RUN apk add --no-cache ffmpeg python3 py3-pip nodejs deno openssl \
  && pip3 install --break-system-packages "yt-dlp[default]"

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

COPY next/package.json next/bun.lock ./
RUN bun install --frozen-lockfile --production

COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/entrypoint.sh ./entrypoint.sh
COPY --from=builder /app/prisma.config.js ./prisma.config.js
COPY prisma ./prisma

# Prisma client, engines, and CLI from builder (avoids network at container start).
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

RUN chmod +x ./entrypoint.sh

EXPOSE 3000

ENTRYPOINT ["./entrypoint.sh"]
CMD ["bun", "server.js"]
