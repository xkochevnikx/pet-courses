# =========================================================

# ОБЩАЯ ИНФОРМАЦИЯ

# Проект: pet-courses-project

# Сервисы: db (Postgres), minio, createbuckets, web (Next.js dev)

# =========================================================

# =========================================================

# 1. ПРОСМОТР ТЕКУЩЕГО СОСТОЯНИЯ DOCKER

# =========================================================

# Все контейнеры

docker ps -a

# Все образы

docker images

# Все volumes

docker volume ls

# Все сети

docker network ls

# =========================================================

# 2. ПОЛНАЯ ОЧИСТКА ПРОЕКТА pet-courses-project

# =========================================================

# Остановить и удалить контейнеры проекта + volumes

docker compose -f docker-compose.yml -f docker-compose.dev.yml down -v

# Удалить volumes проекта вручную (если остались)

docker volume rm pet-courses-project_db-data
docker volume rm pet-courses-project_minio-data

# Удалить кастомные образы проекта

docker rmi local/next-app
docker rmi local/minio
docker rmi local/postgres

# Удалить неиспользуемые образы

docker image prune -a -f

# =========================================================

# 3. ГЛОБАЛЬНАЯ ОЧИСТКА DOCKER (НЕ ПРИВЯЗАНА К ПРОЕКТУ)

# =========================================================

# Удалить ВСЕ контейнеры

docker rm -f $(docker ps -aq)

# Удалить ВСЕ образы

docker rmi -f $(docker images -aq)

# Удалить ВСЕ volumes

docker volume rm $(docker volume ls -q)

# Удалить ВСЕ пользовательские сети

docker network rm $(docker network ls -q | grep -vE 'bridge|host|none')

# Очистить build cache

docker builder prune -a -f

# Полная системная очистка Docker (без volumes)

docker system prune -a -f

# ПОЛНЫЙ NUCLEAR RESET (ВСЁ: контейнеры, образы, volumes, кеш)

# docker system prune -a --volumes -f

# =========================================================

# 4. ПОШАГОВЫЙ ЗАПУСК ПРОЕКТА

# =========================================================

# ШАГ 1 — запустить ТОЛЬКО базу и MinIO

docker compose -f docker-compose.yml up -d db minio

# Проверить статус

docker compose -f docker-compose.yml ps

# =========================================================

# 5. ПРОВЕРКА POSTGRES

# =========================================================

# Логи

docker logs -n 200 db

# Проверка готовности

docker exec -it db sh -lc 'pg_isready -U postgres'

# Подключение к БД

docker exec -it db psql -U postgres -d postgres

# Быстрый SQL-чек

docker exec -it db psql -U postgres -d postgres \
 -c "select now(), current_database(), current_user;"

# =========================================================

# 6. ПРОВЕРКА MINIO

# =========================================================

# Логи

docker logs -n 200 minio

# Health-check

curl http://localhost:9000/minio/health/live

# Web UI

# http://localhost:9001

# login: minio

# password: minio123

# =========================================================

# 7. СОЗДАНИЕ БАКЕТА (INIT-КОНТЕЙНЕР)

# =========================================================

docker compose -f docker-compose.yml up createbuckets
docker compose -f docker-compose.yml logs createbuckets

# =========================================================

# 8. ПРОВЕРКА БАКЕТОВ MINIO (mc)

# =========================================================

docker run --rm \
 --network container:minio \
 -e MC_HOST_myminio="http://minio:minio123@127.0.0.1:9000" \
 minio/mc:latest ls myminio

docker run --rm \
 --network container:minio \
 -e MC_HOST_myminio="http://minio:minio123@127.0.0.1:9000" \
 minio/mc:latest ls myminio/images

# =========================================================

# 9. ЗАПУСК NEXT.JS (DEV)

# =========================================================

docker compose -f docker-compose.yml -f docker-compose.dev.yml up -d web

docker compose -f docker-compose.yml -f docker-compose.dev.yml ps

# =========================================================

# 10. ЛОГИ NEXT.JS

# =========================================================

docker compose -f docker-compose.yml -f docker-compose.dev.yml logs -f web

docker exec -it web-dev sh -lc \
 'env | grep -E "DATABASE_URL|S3_ENDPOINT|S3_BUCKET|S3_PUBLIC_URL|NEXTAUTH_URL"'

# =========================================================

# 11. ПРОВЕРКА STORAGE / MINIO

# =========================================================

curl -i http://localhost:9000/images/hello.txt
curl -i http://localhost:3000/storage/hello.txt

# =========================================================

# 12. ПЕРЕЗАПУСК СЕРВИСОВ

# =========================================================

docker compose -f docker-compose.yml -f docker-compose.dev.yml restart web
docker compose -f docker-compose.yml restart db
docker compose -f docker-compose.yml restart minio

# =========================================================

# 13. ОСТАНОВКА ПРОЕКТА (БЕЗ УДАЛЕНИЯ ДАННЫХ)

# =========================================================

docker compose -f docker-compose.yml -f docker-compose.dev.yml down
