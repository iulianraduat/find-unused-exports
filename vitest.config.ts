import { defineConfig } from 'vitest/config'

const isCI = process.env.CI === 'true'

export default defineConfig({
  test: {
    // Test environment
    environment: 'node',

    // Test patterns
    include: ['tests/**/*.{test,spec}.{js,ts}', 'src/**/*.{test,spec}.{js,ts}'],
    exclude: ['node_modules', 'out', 'test', '**/*.d.ts'],

    // Global setup
    globals: true,

    // Setup files
    setupFiles: ['./tests/setup.ts'],

    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html', 'lcov'],
      reportsDirectory: './coverage',
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.d.ts', 'src/**/*.test.ts', 'src/**/*.spec.ts', 'src/**/index.ts', 'out/**', 'tests/**'],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70,
        },
      },
    },

    // Test timeout
    testTimeout: 3000,

    // Watch mode
    watch: false,

    // Reporter
    reporters: isCI ? ['dot'] : ['verbose', 'json', 'html'],

    // Output directory for reports
    outputFile: {
      json: './coverage/test-results.json',
      html: './coverage/test-results.html',
    },
  },
})
