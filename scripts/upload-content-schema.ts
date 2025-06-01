import { promises as fsPromises } from "fs";
import * as path from "path";

import { compileFromFile } from "json-schema-to-typescript";

import { privateEnv } from "../src/shared/lib/parse-private-env";

// Функция для скачивания и сохранения файла
async function downloadFile(url: string, outputPath: string): Promise<void> {
  const response = await fetch(url);
  const data = await response.text();
  await fsPromises.writeFile(outputPath, data);
}

// Функция для генерации TypeScript типов из JSON схемы
async function generateTypes(
  schemaPath: string,
  outputPath: string,
): Promise<void> {
  const ts = await compileFromFile(schemaPath);
  await fsPromises.writeFile(outputPath, ts);
}

// Основная функция
async function downloadAndGenerateTypes(
  schemaDir: string,
  outputDir: string,
): Promise<void> {
  const schemaFiles = privateEnv.SCHEMA_FILES.split(",");

  for (const file of schemaFiles) {
    const schemaPath = path.join(schemaDir, file);
    const outputPath = path.join(outputDir, file);

    // Скачивание файла
    await downloadFile(schemaPath, outputPath);

    // Генерация TypeScript типов
    const typesOutputPath = path.join(
      outputDir,
      file.replace(".json", ".d.ts"),
    );
    await generateTypes(outputPath, typesOutputPath);
  }
}

downloadAndGenerateTypes(privateEnv.SCHEMA_DIR, privateEnv.OUTPUT_DIR)
  .then(() => console.log("Схемы скачаны и типы сгенерированы!"))
  .catch((error) => console.error("Произошла ошибка:", error));
