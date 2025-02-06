import { dirname } from "path";
import { fileURLToPath } from "url";

import { FlatCompat } from "@eslint/eslintrc"; // ✅ Добавляем FlatCompat для совместимости с extends
import js from "@eslint/js";
import next from "@next/eslint-plugin-next";
import tseslint from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import prettier from "eslint-config-prettier";
import boundaries from "eslint-plugin-boundaries";
import importPlugin from "eslint-plugin-import";
import react from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

// Определяем текущую директорию файла
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Создаем совместимость с `extends`, чтобы поддерживать старый формат конфигурации
const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // 📌 Отключение ESLint для тестовых файлов
  {
    files: ["**/*.test.{js,jsx,ts,tsx}"], // 🟢 Применяется ко всем файлам с `.test.js/.ts/.tsx/.jsx`
    languageOptions: {
      globals: {
        jest: "readonly", // 🟢 Добавляет глобальные переменные для Jest
        describe: "readonly",
        it: "readonly",
        expect: "readonly",
      },
    },
    rules: {
      "no-undef": "off", // 🔥 Отключает ошибку "describe is not defined"
      "import/no-extraneous-dependencies": "off", // 🔥 Игнорирует тестовые зависимости
    },
  },

  // ✅ Подключаем рекомендуемые конфигурации
  ...compat.extends(
    "next/core-web-vitals", // 🟢 Оптимальные настройки для Next.js (Core Web Vitals)
    "next/typescript", // 🟢 Поддержка TypeScript в Next.js
    "prettier", // 🟢 Отключение правил, конфликтующих с Prettier
  ),

  {
    // 🌍 Определяем окружение (браузер + ES2021)
    languageOptions: {
      ecmaVersion: "latest", // 🟢 Используем последнюю версию ECMAScript
      sourceType: "module", // 🟢 Поддержка модулей ES6+
      parser: tsParser, // 🟢 Указываем TypeScript-парсер
    },

    // 🔌 Подключаем установленные ESLint плагины
    plugins: {
      "@next/next": next, // 🟢 Плагин ESLint для Next.js
      "@typescript-eslint": tseslint, // 🟢 Плагин для TypeScript-правил
      react: react, // 🟢 Плагин ESLint для React
      "react-hooks": reactHooks, // 🟢 Плагин для React Hooks
      boundaries: boundaries, // 🟢 Плагин для управления архитектурными границами
      import: importPlugin, // 🟢 Плагин для контроля импортов
    },

    // ⚙️ Настройки для работы с TypeScript и модулями
    settings: {
      react: {
        version: "detect", // 🟢 Автоматическое определение версии React
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true, // 🟢 Разрешает TypeScript модули
        },
      },
      // 🎯 Настройки для ESLint Boundaries (разделение по слоям)
      "boundaries/include": ["src/**/*"], // 🟢 Включаем весь `src`
      "boundaries/elements": [
        { type: "app", pattern: "app" }, // 🔹 App-слой
        { type: "pages", pattern: "src/pages/*", capture: ["page"] }, // 🔹 Страницы
        { type: "widgets", pattern: "widgets/*", capture: ["widget"] }, // 🔹 Виджеты
        { type: "features", pattern: "features/*", capture: ["feature"] }, // 🔹 Фичи
        { type: "entities", pattern: "entities/*", capture: ["entity"] }, // 🔹 Сущности
        { type: "shared", pattern: "shared/*", capture: ["segment"] }, // 🔹 Общие модули
      ],
    },

    // 📜 **Правила ESLint**
    rules: {
      // ✅ Подключаем рекомендуемые правила из плагинов
      ...js.configs.recommended.rules, // 🟢 Стандартные правила JavaScript
      ...next.configs.recommended.rules, // 🟢 Оптимальные правила для Next.js
      ...tseslint.configs.recommended.rules, // 🟢 Рекомендации для TypeScript
      ...react.configs.recommended.rules, // 🟢 Рекомендации для React
      ...reactHooks.configs.recommended.rules, // 🟢 Проверки для React Hooks
      ...prettier.rules, // 🟢 Отключение правил, конфликтующих с Prettier

      "react/react-in-jsx-scope": "off", // 🔥 Отключаем, так как с React 17+ не нужен `import React`
      "no-console": ["warn", { allow: ["warn", "error"] }],

      // 📌 **Настройки для архитектурных границ (Boundaries)**
      "boundaries/entry-point": [
        "error",
        {
          default: "disallow",
          rules: [
            { target: [["shared", { segment: "lib" }]], allow: "**" },
            { target: [["shared", { segment: "constants" }]], allow: "**" },
            { target: [["shared", { segment: "config" }]], allow: "**" },
            { target: [["shared", { segment: "ui" }]], allow: "**" },
            { target: [["shared", { segment: "api" }]], allow: "index.ts" },
            {
              target: ["app", "pages", "widgets", "features", "entities"],
              allow: "index.(ts|tsx)",
            },
          ],
        },
      ],

      // 🚫 **Запрещаем импортировать верхние слои**
      "boundaries/element-types": [
        "error",
        {
          default: "allow",
          message: "${file.type} is not allowed to import (${dependency.type})",
          rules: [
            {
              from: ["shared"],
              disallow: ["app", "pages", "widgets", "features", "entities"],
              message:
                "Shared module must not import upper layers (${dependency.type})",
            },
            {
              from: ["entities"],
              disallow: ["app", "pages", "widgets", "features"],
              message:
                "Entity must not import upper layers (${dependency.type})",
            },
            {
              from: ["features"],
              disallow: ["app", "pages", "widgets"],
              message:
                "Feature must not import upper layers (${dependency.type})",
            },
            {
              from: ["widgets"],
              disallow: ["app", "pages"],
              message:
                "Widget must not import upper layers (${dependency.type})",
            },
            {
              from: ["pages"],
              disallow: ["app"],
              message: "Page must not import upper layers (${dependency.type})",
            },
          ],
        },
      ],

      // 🛑 **Отключаем правило, требующее экспорт только компонентов в файлах React**
      "react-refresh/only-export-components": "off",

      // 📌 **Упорядочивание импортов**
      "import/order": [
        "error", // Ошибка при нарушении порядка импортов
        {
          groups: [
            "builtin", // 🟢 Встроенные модули Node.js (fs, path, http)
            "external", // 🟢 Внешние зависимости из `node_modules` (react, axios, lodash)
            "internal", // 🟢 Модули внутри проекта (например, `@frontend/utils`)
            "parent", // 🟢 Импорты из родительских директорий (`../utils`, `../../config`)
            "sibling", // 🟢 Импорты файлов из той же директории (`./helper`)
            "index", // 🟢 Импорты `index.ts` внутри текущей директории (`./`)
            "object", // 🟢 Специальные object-style импорты (`import * as utils from './utils'`)
            "type", // 🟢 TypeScript-импорты (`import type { User } from './types'`)
          ],
          "newlines-between": "always", // ✅ Добавляет пустую строку между группами
          alphabetize: {
            order: "asc", // 🔠 Сортирует импорты **по алфавиту** внутри группы
            caseInsensitive: true, // 🔡 Игнорирует регистр букв (A == a)
          },
        },
      ],

      // 🛑 **Игнорируем неиспользуемые переменные, начинающиеся с `_`**
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      // 🚫 **Запрещаем использование `any`**
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },
];

export default eslintConfig;
