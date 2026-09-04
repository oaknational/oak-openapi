/// <reference types="vitest/config" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';
import graphql from 'vite-plugin-graphql-loader';

export default defineConfig({
  plugins: [graphql(), tsconfigPaths()],

  test: {
    // 10 seconds - in CI, sometimes the asset and sequence
    //  tests take 5-7s (assume a connectivity latency issue)
    testTimeout: 10000,

    coverage: {
      provider: 'v8',
      // json-summary feeds the coverage table in the CI job summary.
      reporter: ['text', 'json-summary', 'html'],
      reportsDirectory: './coverage',
      include: ['src/**'],
      exclude: [
        // UI and generated code, neither of which the suite targets.
        'src/old/**',
        'src/**/*.d.ts',
        'src/lib/version.ts',
        'src/lib/keyStageAndSubjects.json',
      ],
      // Ratcheted floor, not an aspiration: raise it when coverage rises, and
      // never lower it to make a build pass.
      // Set just below the figures on 20 August 2026 (lines 54.9,
      // statements 54.8, functions 45.9, branches 48.1) so ordinary variation
      // does not fail a build.
      thresholds: {
        lines: 50,
        statements: 50,
        functions: 42,
        branches: 45,
      },
    },
  },
});
