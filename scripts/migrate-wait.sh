#!/bin/sh
set -eu

host="${MIGRATION_HOST:-db}"
port="${MIGRATION_PORT:-5432}"

until nc -z "$host" "$port"; do
  sleep 1
done

exec npx prisma migrate deploy --schema "$MIGRATION_SCHEMA"
