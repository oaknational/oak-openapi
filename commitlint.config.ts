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
        // Replaces the built-in body-max-line-length: prose must still wrap,
        // but a line is exempt when a single unbreakable token (e.g. a URL)
        // is what pushes it over the limit — you can't wrap a URL.
        'body-max-line-length-allow-urls': ({ body }, _when, max) => {
          const limit = typeof max === 'number' ? max : 100;
          const offenders = (body ?? '').split('\n').filter((line) => {
            if (line.length <= limit) return false;
            const longestToken = line
              .split(/\s+/)
              .reduce((n, token) => Math.max(n, token.length), 0);
            return longestToken <= limit;
          });
          return [
            offenders.length === 0,
            `body lines must not exceed ${limit} characters (unbreakable URLs exempt)`,
          ];
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
    'body-max-line-length': [0], // replaced by body-max-line-length-allow-urls
    'body-max-line-length-allow-urls': [2, 'always', 100],
  },
};

export default config;
