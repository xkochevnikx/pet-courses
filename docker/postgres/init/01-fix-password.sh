#!/bin/sh
set -e

echo "[db-init] POSTGRES_USER=${POSTGRES_USER:-<empty>}"
echo "[db-init] POSTGRES_DB=${POSTGRES_DB:-<empty>}"
echo "[db-init] POSTGRES_PASSWORD is set? $([ -n "${POSTGRES_PASSWORD:-}" ] && echo yes || echo no)"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
  ALTER USER "${POSTGRES_USER}" WITH PASSWORD '${POSTGRES_PASSWORD}';
SQL

echo "[db-init] done"