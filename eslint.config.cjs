const { defineConfig } = require('eslint/config');
const nextVitals = require('eslint-config-next/core-web-vitals');
const nextTs = require('eslint-config-next/typescript');

module.exports = defineConfig([
  // Next.js recommended flat configs
  ...nextVitals,
  ...nextTs,

  // Project-wide rules and plugin wiring
  {
    files: ['**/*.{js,jsx,ts,tsx}'],
    languageOptions: {
      parser: require('@typescript-eslint/parser'),
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
        ecmaFeatures: { jsx: true },
        project: ['./tsconfig.json'],
      },
    },
    plugins: {
      '@typescript-eslint': require('@typescript-eslint/eslint-plugin'),
      prettier: require('eslint-plugin-prettier'),
    },
    settings: { react: { version: 'detect' } },
    rules: {
      'prettier/prettier': 'error',
    },
  },

  // Global ignores
  {
    ignores: ['.next/**', 'out/**', 'build/**', 'next-env.d.ts'],
  },
]);
