#!/bin/sh
set -e

echo "==> Syncing database schema..."
prisma db push --schema=./prisma/schema.prisma --skip-generate --accept-data-loss 2>&1 || \
  echo "==> WARNING: Schema push failed. Check DATABASE_URL."

echo "==> Starting MedScribe AI..."
exec node server.js
