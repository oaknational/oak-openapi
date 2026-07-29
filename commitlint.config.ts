// commitlint.config.ts
import type { UserConfig } from '@commitlint/types';

// Commit scopes drive releases: only `api`-scoped feat/fix/perf/revert commits
// move the version. A scope is therefore required on every commit and must be
// one of these — a near-miss like `fix(API):` or `fix(apis):` would parse fine
// but silently fail to match the release rules. See docs/RELEASING.md.
const scopes = [
  'api',
  'bulk',
  'ci',
  'deps',
  'docs',
  'infra',
  'playground',
  'release',
  'repo',
];

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'scope-empty': [2, 'never'],
    'scope-enum': [2, 'always', scopes],
    'scope-case': [2, 'always', 'lower-case'],
  },
};

export default config;
