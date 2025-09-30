import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default [
  // Ignore patterns
  {
    ignores: [
      'dist',
      'node_modules',
      '*.config.js',
      '*.config.ts',
      'coverage',
      '.pnpmfile.cjs',
      'public/**',
      '*.test.ts',
      '*.test.tsx',
      'vitest.config.*.ts',
      'src/utils/serviceWorker.ts',
      'src/testing/**',
      '.claude/**'
    ]
  },

  // Base JavaScript configuration
  js.configs.recommended,

  // TypeScript configuration - use the flat config directly
  ...tseslint.configs.recommended,

  // Global settings for all files
  {
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
  },

  // TypeScript and React specific rules
  {
    files: ['**/*.{ts,tsx}'],
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    languageOptions: {
      parserOptions: {
        project: './tsconfig.json',
      },
    },
    rules: {
      // React Hooks rules
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'off', // Too many false positives

      // React Refresh
      'react-refresh/only-export-components': 'off', // Not critical for dev

      // TypeScript type checking rules - enable as warnings
      '@typescript-eslint/no-explicit-any': 'off', // Turn off completely for now
      '@typescript-eslint/no-unused-vars': ['warn', {
        argsIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }],
      '@typescript-eslint/no-empty-interface': 'off',
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-inferrable-types': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      '@typescript-eslint/no-namespace': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-require-imports': 'off',
      '@typescript-eslint/no-unsafe-function-type': 'off',

      // Enable type checking for object properties
      '@typescript-eslint/consistent-type-imports': 'off', // Nice to have but not critical
      '@typescript-eslint/no-misused-promises': 'off', // Too many false positives with React event handlers
      '@typescript-eslint/no-floating-promises': 'warn',

      // JavaScript rules
      'prefer-const': 'warn',
      'no-var': 'warn',
      'no-console': 'off',
      'no-debugger': 'warn',
      'no-empty': 'off',
      'no-empty-pattern': 'off',
      'no-unused-expressions': 'off',
      'no-case-declarations': 'off', // Block scope issues can be handled by developer
      'no-useless-escape': 'off',
      'no-prototype-builtins': 'off',
      'no-unexpected-multiline': 'warn', // Change to warning
      'no-irregular-whitespace': 'off',
      'no-control-regex': 'off',
      'no-constant-condition': 'off',
      'no-constant-binary-expression': 'off', // Disable this rule
      'no-undef': 'off', // TypeScript handles this

      // Import rules
      'no-restricted-imports': 'off',

      // Completely disable complexity checks
      'max-lines': 'off',
      'complexity': 'off',
      'max-params': 'off',
    },
  },

  // Test files - completely relaxed
  {
    files: ['**/__tests__/**', '**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-unused-vars': 'off',
      'no-console': 'off',
    },
  },

  // Configuration files
  {
    files: ['*.config.{js,ts}', 'scripts/**/*'],
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },
]