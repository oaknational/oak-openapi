# CI workflows

Every workflow here declares an explicit `permissions:` block, pins third-party
actions to a full commit SHA with the version in a trailing comment, and accepts
`workflow_dispatch` so it can be run by hand without pushing a commit.

| Workflow                      | Runs when                                                  | What it does                                                                 |
| ----------------------------- | ---------------------------------------------------------- | ---------------------------------------------------------------------------- |
| [`test.yml`](test.yml)        | Pull requests to `main`; manually                           | Runs the Vitest suite with coverage, writes a coverage table to the job summary, and uploads the report for 14 days. |
| [`lint.yml`](lint.yml)        | Pull requests to `main`; manually                           | `pnpm lint` (ESLint + `tsc --noEmit`) and `pnpm format:check`.                |
| [`commitlint.yml`](commitlint.yml) | Pull requests to `main`; manually                      | Lints every commit message in the PR range. The scope decides whether a change is released, so husky alone is not enough. |
| [`dependency-review.yml`](dependency-review.yml) | Pull requests to `main`; manually         | Blocks dependencies with high-severity advisories or incompatible copyleft licences at review time, rather than after merge. |
| [`codeql.yml`](codeql.yml)    | Pull requests and pushes to `main`; Mondays 05:00 UTC; manually | CodeQL static analysis of the TypeScript and of the workflow files themselves, with the `security-and-quality` query suite. Results appear under the Security tab. |
| [`link-check.yml`](link-check.yml) | Pull requests touching Markdown; Mondays 07:00 UTC; manually | Checks every link in every Markdown file, including anchors. Fails the build on a broken link. |
| [`terraform_checks.yml`](terraform_checks.yml) | Pushes and PRs touching `infrastructure/`; manually | `terraform fmt`/`validate`/`tflint` via `oaknational/oak-terraform-actions`. |
| [`terraform_vercel_drift.yml`](terraform_vercel_drift.yml) | Pushes to `main` touching `infrastructure/`; manually | Detects drift between Terraform state and the live Vercel project, and reports to Slack. |
| [`build-bulk-data-image.yml`](build-bulk-data-image.yml) | Pull requests; published releases; manually | Builds the `bulk-data` container image and pushes it to Oak's Artifact Registry. Authenticates with Workload Identity Federation — no long-lived key. |
| [`release.yml`](release.yml)  | Pushes to `main`; manually                                  | Runs semantic-release: works out the next version from the commits, updates `CHANGELOG.md` and `src/lib/version.ts`, tags, and publishes a GitHub release. |

## Required status checks

The branch ruleset on `main` requires these checks by name. **If you rename a
job, update the ruleset in the same change** — a renamed job silently stops
being required:

- `test`
- `lint`
- `commitlint`
- `dependency-review`
- `terraform-lint-format`
- `deploy`

`link-check` is deliberately not required: it also runs on a schedule against
live external sites, which should not be able to block an unrelated merge.

`codeql` is not required either, for now. Its check names carry the matrix
language — `analyse (javascript-typescript)` and `analyse (actions)` — so both
must be added by name if it is ever made a required check.

## Releases

`release.yml` needs to push a release commit to `main`, which is protected.
`GITHUB_TOKEN` cannot do that, so the workflow mints a token for a GitHub App
that sits on the ruleset's bypass list. The app and the reasoning are described
in [`docs/RELEASING.md`](../../docs/RELEASING.md).

Only commits scoped `api` produce a release. See
[`.releaserc.json`](../../.releaserc.json).
