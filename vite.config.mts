/// <reference types="vitest" />

import { defineConfig } from 'vite';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [tsconfigPaths()],

  test: {
    // 10 seconds - in CI, sometimes the asset and sequence
    //  tests take 5-7s (assume a connectivity latency issue)
    testTimeout: 10000,
  },
});
