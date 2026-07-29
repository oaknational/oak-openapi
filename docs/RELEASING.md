# Releasing

This project is versioned with [semantic versioning](https://semver.org) and
released automatically by [semantic-release](https://semantic-release.gitbook.io)
from conventional commit messages.

**The version tracks the API contract.** Only commits scoped `api` move it.
Everything else — the playground, the bulk pipeline, infrastructure, docs —
still deploys to production on merge, it just doesn't change the version or
appear in the changelog.

## What causes a release

| Commit                                | Result                 |
| ------------------------------------- | ---------------------- |
| `fix(api): …`                         | patch (`0.7.0→0.7.1`)  |
| `perf(api): …` / `revert(api): …`     | patch                  |
| `feat(api): …`                        | minor (`0.7.0→0.8.0`)  |
| `feat(api)!: …` / `BREAKING CHANGE:`  | major (`0.7.0→1.0.0`)  |
| Any other scope, or any other type    | no release             |

So `chore(api): tidy handler imports` deploys but doesn't release, and
`feat(playground): new footer` deploys but doesn't release. Only the four rows
above move the number.

The rules live in [`.releaserc.json`](../.releaserc.json). Two things about them
are non-obvious and easy to break:

- **Later rules override earlier ones.** The catch-all `{ "type": "*", "release":
  false }` must stay **first**, with the `api` rules after it. Put it last and
  nothing will ever release.
- **The `parserOpts` block is required for `!`.** Without it the default header
  pattern doesn't recognise `feat(api)!:` — the commit fails to parse entirely,
  contributing neither a release nor a changelog entry. The `BREAKING CHANGE:`
  footer works either way.

If you change those rules, verify them before merging (see
[Testing the rules](#testing-the-rules)).

## Scopes are required

[`commitlint.config.ts`](../commitlint.config.ts) requires a lower-case scope
from a fixed list on every commit. This exists because the failure mode of scope
gating is silent: `fix(API):` or `fix(apis):` is a perfectly valid conventional
commit that simply never matches the release rules, so a real API change would
ship with no version bump and no changelog entry.

Requiring the scope catches "forgot to add one"; the enum catches "typed it
slightly wrong". Add to the list when a genuinely new area appears — it's a
guardrail, not a taxonomy.

`husky` checks this on commit locally. [`commitlint.yml`](../.github/workflows/commitlint.yml)
checks the whole PR range in CI, which covers commits made in the GitHub web UI
or with `--no-verify`.

**What it cannot catch** is misjudgement: deciding a change isn't an API change
when it is. Nothing automated will save you there, so when in doubt, scope it
`api` — an unnecessary patch release is cheap, a silently unreleased API change
is not.

## How a release happens

1. You merge a PR to `main`. Vercel deploys it, as always — **every** merge
   deploys, regardless of scope.
2. [`release.yml`](../.github/workflows/release.yml) runs semantic-release.
3. If no `api`-scoped releasable commit has landed since the last release, it
   exits and nothing happens.
4. Otherwise it works out the next version, writes `CHANGELOG.md`,
   `package.json` and [`src/lib/version.ts`](../src/lib/version.ts), commits
   `chore(release): x.y.z [skip ci]` to `main`, tags `vx.y.z`, and publishes a
   GitHub Release.
5. That commit triggers a second Vercel deploy — the one that actually serves
   the new version.

**Accepted trade-off:** an `api` merge deploys twice, a couple of minutes apart,
and in the gap production reports the previous version in `swagger.json`. The
version's only surface is the OpenAPI document, so this is cosmetic.

Release notes are generated from commit subjects. They are what API consumers
read, so write `feat(api):` subjects for them, and edit the GitHub Release
afterwards if it warrants better prose.

## Branch protection

`main` is protected, and `GITHUB_TOKEN` cannot push to it. The release workflow
mints a token for a GitHub App on the bypass list via
`actions/create-github-app-token`, using two secrets:

| Secret                     | Value                        |
| -------------------------- | ---------------------------- |
| `RELEASE_APP_ID`           | The App's ID                 |
| `RELEASE_APP_PRIVATE_KEY`  | The App's private key (PEM)  |

The App needs `contents: write` on this repository and must be added to `main`'s
bypass list. Without it the workflow fails at the push step, after having
already tagged — so get it provisioned before the first `api` commit lands.

## The URL major is not the semver major

The public API is served under `/api/v0`. That segment comes from
[`src/lib/apiVersion.ts`](../src/lib/apiVersion.ts) and is a **routing
decision**, deliberately decoupled from the version.

This matters because `baseUrl` is interpolated into live response payloads —
asset URLs and pagination links — so a major bump must never silently move the
URL space out from under existing consumers.

Moving to `/api/v1` is manual work, not a side effect of a version bump:

1. Create `src/app/api/v1/` alongside `v0`.
2. Update `API_MAJOR` in `src/lib/apiVersion.ts`.
3. Decide what `/api/v0` does — it stays in place taking security patches only,
   and should tell callers that `v1` exists.
4. Update [ENDPOINTS.md](ENDPOINTS.md) and the docs.

## Releasing on 0.x

The project is on `0.x`, where the semver spec permits anything to change at any
time — `0.6.0` shipped a breaking change as a minor. The move to `1.0.0` happens
the first time someone writes `feat(api)!:` or a `BREAKING CHANGE:` footer.
Write one deliberately, not by accident.

## Testing the rules

`.releaserc.json` is configuration with real failure modes and no test coverage.
To check a change to it, call the analyser directly:

```bash
node --input-type=module -e "
import { analyzeCommits } from '@semantic-release/commit-analyzer';
import { readFile } from 'node:fs/promises';
const rc = JSON.parse(await readFile('.releaserc.json', 'utf8'));
const [, config] = rc.plugins.find(p => Array.isArray(p) && p[0] === '@semantic-release/commit-analyzer');
for (const m of ['feat(api): x', 'fix(api): x', 'feat(api)!: x', 'feat: x', 'chore(api): x']) {
  console.log(String(await analyzeCommits(config, { commits: [{ hash: 'a', message: m }], logger: { log: () => {} } })).padEnd(6), m);
}"
```

Expected: `minor`, `patch`, `major`, `null`, `null`.

## Where the version is exposed

The only runtime surface is the OpenAPI document's `info.version`, visible in
`/playground` and `swagger.json`, read from `src/lib/version.ts`.

The `/changelog` and `/changelog/latest` endpoints were removed; GitHub Releases
and [CHANGELOG.md](../CHANGELOG.md) replace them. The entries at `0.7.0` and
below in that file are the hand-written historical record and sit below a marker
comment — semantic-release only ever prepends above it.

`package.json` keeps `private: true`; nothing is published to npm.
