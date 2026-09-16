import path from "path";
import { fileURLToPath } from "url";

import { postgresAdapter } from "@payloadcms/db-postgres";
import { lexicalEditor } from "@payloadcms/richtext-lexical";
import { buildConfig } from "payload";
import sharp from "sharp";

import { Courses } from "./collections/Courses";
import { Media } from "./collections/Media";
import { Users } from "./collections/Users";
import { privateEnv } from "./shared/lib/env/parse-private-env";

// Путь к текущему файлу (нужен для importMap / outputFile в ESM)
const filename = fileURLToPath(import.meta.url);
// Директория конфига — база для относительных путей Payload
const dirname = path.dirname(filename);

export default buildConfig({
  admin: {
    // Коллекция с auth: true — кто логинится в /admin (не NextAuth)
    user: "users",
    importMap: {
      // Откуда резолвить кастомные admin-компоненты / import map
      baseDir: path.resolve(dirname),
    },
  },
  // Зарегистрированные коллекции CMS (таблицы + UI в админке)
  collections: [Courses, Users, Media],
  // Редактор rich text по умолчанию (Lexical) для richText-полей
  editor: lexicalEditor(),
  // Секрет шифрования/сессий Payload (из env)
  secret: privateEnv.PAYLOAD_SECRET,
  typescript: {
    // Куда писать сгенерированные типы (payload generate:types)
    outputFile: path.resolve(dirname, "payload-types.ts"),
  },
  db: postgresAdapter({
    pool: {
      // Подключение к БД курсов (db-courses), не Prisma sessions
      connectionString: privateEnv.PAYLOAD_DATABASE_URL,
    },
  }),
  // Обработка картинок (ресайз/оптимизация upload)
  sharp,
  // Плагины Payload (сейчас пусто)
  plugins: [],
});
