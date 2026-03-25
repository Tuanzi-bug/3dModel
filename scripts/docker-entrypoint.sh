#!/bin/sh
set -e
echo "Installing dependencies..."
pnpm install
echo "Running Prisma migrations..."
pnpm --filter web exec prisma migrate dev --skip-generate 2>/dev/null || \
  pnpm --filter web exec prisma migrate deploy
echo "Generating Prisma client..."
pnpm --filter web exec prisma generate
echo "Starting dev server..."
exec pnpm --filter web dev
