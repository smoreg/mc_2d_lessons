'use strict';

// Конфигурация ESLint (новый "flat" формат).
// Проверяем и обычные .js файлы, и JavaScript внутри .html (через eslint-plugin-html).

const html = require('eslint-plugin-html');

// Глобальные имена, которые есть в браузере.
const browserGlobals = {
  window: 'readonly',
  document: 'readonly',
  console: 'readonly',
  alert: 'readonly',
  prompt: 'readonly',
  confirm: 'readonly',
  requestAnimationFrame: 'readonly',
  localStorage: 'readonly',
  setTimeout: 'readonly',
  setInterval: 'readonly',
  Image: 'readonly',
  globalThis: 'readonly',
};

// Глобальные имена, которые есть в Node.js (используются в game/js и тестах).
const nodeGlobals = {
  module: 'writable',
  require: 'readonly',
  process: 'readonly',
  globalThis: 'readonly',
};

const sharedRules = {
  'no-unused-vars': ['warn', { args: 'none' }],
  'no-undef': 'error',
  eqeqeq: ['warn', 'smart'],
  'no-var': 'warn',
};

module.exports = [
  // Что не проверяем.
  { ignores: ['node_modules/**'] },

  // Игровые модули: работают и в браузере, и в Node.
  {
    files: ['game/js/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...browserGlobals, ...nodeGlobals },
    },
    rules: sharedRules,
  },

  // Автотесты: окружение Node.
  {
    files: ['tests/**/*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...nodeGlobals },
    },
    rules: sharedRules,
  },

  // Сам конфиг и прочие корневые .js — окружение Node.
  {
    files: ['*.js'],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...nodeGlobals },
    },
    rules: sharedRules,
  },

  // JavaScript внутри уроков (.html файлы).
  {
    files: ['lessons/**/*.html', 'game/**/*.html'],
    plugins: { html },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'script',
      globals: { ...browserGlobals },
    },
    rules: {
      ...sharedRules,
      // В уроках часто есть «заготовки» для самостоятельной работы — не ругаемся на них.
      'no-unused-vars': 'off',
    },
  },
];
