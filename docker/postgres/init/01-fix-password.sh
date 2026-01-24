#!/bin/sh
set -e

# Этот скрипт выполняется ТОЛЬКО при первом создании PGDATA (пустой volume).
# POSTGRES_USER/POSTGRES_PASSWORD/POSTGRES_DB уже доступны как env.

echo "[db-init] ensure password for role '${POSTGRES_USER}'"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-SQL
  ALTER USER "${POSTGRES_USER}" WITH PASSWORD '${POSTGRES_PASSWORD}';
SQL

echo "[db-init] done"