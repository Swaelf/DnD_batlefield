import { defineConfig, mergeConfig } from 'vite'
import { defineConfig as defineVitestConfig } from 'vitest/config'
import viteConfig from './vite.config'

// Dedicated configuration for coverage analysis
export default mergeConfig(
  viteConfig,
  defineVitestConfig({
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: './src/test/setup.ts',
      css: true,
      coverage: {
        provider: 'v8',
        enabled: true,
        clean: true,
        cleanOnRerun: true,
        reportsDirectory: './coverage',
        reporter: ['text', 'text-summary', 'json', 'html', 'lcov', 'clover'],

        // Coverage thresholds
        thresholds: {
          statements: 70,
          branches: 70,
          functions: 70,
          lines: 70,
          perFile: false,
        },

        // Files to include in coverage
        include: [
          'src/**/*.{ts,tsx}',
        ],

        // Files to exclude from coverage
        exclude: [
          // Test files
          'src/**/*.{test,spec}.{ts,tsx}',
          'src/**/__tests__/**',
          'src/**/__mocks__/**',
          'src/test/**',

          // Type definitions
          'src/**/*.d.ts',
          'src/types/**',

          // Config files
          'src/**/*.config.{ts,js}',
          'src/vite-env.d.ts',

          // Entry points and setup
          'src/main.tsx',

          // Generated files
          'dist/**',
          'coverage/**',
          'node_modules/**',

          // Stories (if using Storybook)
          'src/**/*.stories.{ts,tsx}',
        ],

        // Coverage reporting options
        all: true, // Include all files, even those not imported in tests
        skipFull: false, // Don't skip files with 100% coverage in report
        reportOnFailure: true, // Generate report even if tests fail

        // Source map configuration
        extension: ['.ts', '.tsx'],

        // Additional coverage options
        watermarks: {
          statements: [70, 90],
          functions: [70, 90],
          branches: [70, 90],
          lines: [70, 90]
        },

        // Per-file coverage requirements for critical files
        // perFileThresholds: {
        //   'src/store/**/*.ts': {
        //     statements: 85,
        //     branches: 85,
        //     functions: 85,
        //     lines: 85
        //   },
        //   'src/utils/**/*.ts': {
        //     statements: 90,
        //     branches: 90,
        //     functions: 90,
        //     lines: 90
        //   }
        // }
      },

      // Test execution options
      testTimeout: 10000,
      hookTimeout: 10000,
      isolate: true,
      threads: true,

      // Reporter configuration for better visibility
      reporters: ['verbose'],

      // Only include test files
      include: [
        'src/**/*.{test,spec}.{ts,tsx}',
        'src/**/__tests__/**/*.{ts,tsx}'
      ]
    },
  })
)