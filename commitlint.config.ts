// commitlint.config.ts
import type { UserConfig } from '@commitlint/types';

// Commit scopes drive releases: only `api`-scoped feat/fix/perf/revert commits
// move the version. Scopes are required for all other types and must be one of
// these — a near-miss like `fix(API):` or `fix(apis):` would parse fine but
// silently fail to match the release rules. See docs/RELEASING.md.
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

const scopeExemptTypes = ['chore', 'docs', 'test'];

const config: UserConfig = {
  extends: ['@commitlint/config-conventional'],
  plugins: [
    {
      rules: {
        'scope-required-unless-exempt': ({ type, scope }) => {
          if (scopeExemptTypes.includes(type ?? '')) {
            return [true];
          }

          if (!scope) {
            return [false, 'scope is required for this commit type'];
          }

          if (!scopes.includes(scope)) {
            return [false, `scope must be one of: ${scopes.join(', ')}`];
          }

          if (scope !== scope.toLowerCase()) {
            return [false, 'scope must be lower-case'];
          }

          return [true];
        },
      },
    },
  ],
  rules: {
    'scope-required-unless-exempt': [2, 'always'],
  },
};

export default config;
