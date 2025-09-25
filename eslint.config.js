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

      // Additional TypeScript strictness
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

      // Architecture enforcement rules
      'no-restricted-imports': ['error', {
        patterns: [
          {
            group: ['**/components/*/*'],
            message: 'Import from component index files, not internal files. Use: import { Component } from "@/shared/components"'
          },
          {
            group: ['**/store/*'],
            message: 'Use facade hooks instead of direct store access. Create hooks in module hooks/ folder.'
          },
          {
            group: ['@/types', '@/types/*'],
            message: 'Import types from foundation: import { Type } from "@/foundation/types"'
          },
          {
            group: ['../../../*'],
            message: 'Avoid deep relative imports. Use absolute imports with @ aliases.'
          }
        ]
      }],

      // Component architecture rules
      'max-lines': ['error', {
        max: 150,
        skipBlankLines: true,
        skipComments: true
      }],
      'complexity': ['error', 10],
      'max-params': ['error', 7],

      // File naming and structure
      'prefer-const': 'error',
      'no-var': 'error'
    },
  },
  {
    // Allow 'any' in test files where it's often necessary
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}', '**/test/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
])
