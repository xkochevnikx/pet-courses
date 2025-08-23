
#!/bin/sh
set -e

# Применяем миграции безопасно (в прод-режиме)
npx prisma migrate deploy || npx prisma db push

# Запуск Next.js (prod)
npm run start

