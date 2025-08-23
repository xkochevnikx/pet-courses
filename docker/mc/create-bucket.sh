#!/bin/sh
set -eu
: "${MINIO_HOST:=http://minio:9000}"
: "${MINIO_ROOT_USER:?MINIO_ROOT_USER is required}"
: "${MINIO_ROOT_PASSWORD:?MINIO_ROOT_PASSWORD is required}"
: "${BUCKET_NAME:=images}"

echo "⏳ Waiting for MinIO to be ready at ${MINIO_HOST} ..."
for i in $(seq 1 60); do
  if mc alias set myminio "${MINIO_HOST}" "${MINIO_ROOT_USER}" "${MINIO_ROOT_PASSWORD}" >/dev/null 2>&1; then
    break
  fi
  sleep 1
done

echo "🪣 Creating bucket '${BUCKET_NAME}' if not exists..."
mc mb myminio/${BUCKET_NAME} || echo "Bucket already exists"

echo "🌍 Making bucket '${BUCKET_NAME}' public..."
mc anonymous set public myminio/${BUCKET_NAME} || true

echo "✅ MinIO bucket init done."