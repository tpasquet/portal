#!/bin/sh
set -eu

BACKUP_DIR="/backups"
RETENTION_DAYS="${BACKUP_RETENTION_DAYS:-14}"
INTERVAL_SECONDS="${BACKUP_INTERVAL_SECONDS:-86400}"
BACKUP_PREFIX="${BACKUP_PREFIX:-database}"

mkdir -p "$BACKUP_DIR"

while true; do
  timestamp=$(date +%Y%m%d-%H%M%S)
  file="$BACKUP_DIR/${BACKUP_PREFIX}-${timestamp}.sql.gz"
  echo "[backup] dumping database to $file"
  pg_dump "$DATABASE_URL" | gzip > "$file"

  echo "[backup] pruning backups older than $RETENTION_DAYS days"
  find "$BACKUP_DIR" -name "${BACKUP_PREFIX}-*.sql.gz" -mtime "+$RETENTION_DAYS" -delete

  sleep "$INTERVAL_SECONDS"
done
