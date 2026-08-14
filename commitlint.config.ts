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
  // Release commits are written by semantic-release, with the generated release
  // notes as the body — those changelog lines exceed body-max-line-length. CI
  // sets HUSKY=0, this covers running semantic-release locally.
  ignores: [(message) => message.startsWith('chore(release):')],
  rules: {
    'scope-required-unless-exempt': [2, 'always'],
  },
};

export default config;
