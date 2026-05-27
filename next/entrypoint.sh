#!/bin/sh
set -e

# Run Prisma bootstrap in development by default, or when explicitly enabled.
if [ "$APP_ENV" = "development" ] || [ "$RUN_PRISMA_BOOTSTRAP" = "1" ]; then
  echo "Generating Prisma Client..."
  bunx prisma generate --config=/app/prisma.config.js

  if [ "$APP_ENV" = "production" ]; then
    echo "Running database migrations..."
    bunx prisma migrate deploy --config=/app/prisma.config.js
  else
    echo "Skipping deploy migrations (APP_ENV=$APP_ENV)."
  fi
else
  echo "Skipping Prisma bootstrap (APP_ENV=$APP_ENV, RUN_PRISMA_BOOTSTRAP=${RUN_PRISMA_BOOTSTRAP:-0})."
fi

# Execute the main container command (bun run dev or bun run start)
exec "$@"
