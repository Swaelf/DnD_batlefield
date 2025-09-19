import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'
import { defineConfig, globalIgnores } from 'eslint/config'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.recommended,
      reactHooks.configs['recommended-latest'],
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    rules: {
      // TypeScript strict rules to prevent 'any' usage
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',

      // Additional TypeScript strictness
      '@typescript-eslint/prefer-unknown-to-any': 'error',
      '@typescript-eslint/ban-types': ['error', {
        types: {
          'Object': {
            message: 'Avoid using the `Object` type. Did you mean `object`?',
          },
          'Function': {
            message: 'Avoid using the `Function` type. Prefer a specific function type, like `() => void`.',
          },
          'Boolean': {
            message: 'Avoid using the `Boolean` type. Did you mean `boolean`?',
          },
          'Number': {
            message: 'Avoid using the `Number` type. Did you mean `number`?',
          },
          'String': {
            message: 'Avoid using the `String` type. Did you mean `string`?',
          },
          'Symbol': {
            message: 'Avoid using the `Symbol` type. Did you mean `symbol`?',
          },
        },
      }],
    },
  },
  {
    // Allow 'any' in test files where it's often necessary
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-any': 'off',
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/no-unsafe-argument': 'off',
    },
  },
])
