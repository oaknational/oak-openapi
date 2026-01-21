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
  },
});
