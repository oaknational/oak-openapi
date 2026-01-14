# V0 dependency upgrade checklist (staged batches)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Purpose
- Provide small, low‑risk upgrade batches for v0 stability, with clear checkpoints and cross‑references.

Cross-references
- Full list and grouping: `.agent/summary/analysis/dependency-outdated-analysis.md`.
- V0/V1 split: `.agent/summary/analysis/versioned-improvements.md`.
- V1 planning: `.agent/summary/analysis/v1-upgrade-roadmap.md`.

Batch 0 (priority): Zod 4 + zod-openapi 4.x
- Goal: deliver the requested Zod 4 upgrade while staying on the latest zod-openapi 4.x.
- Steps:
  - Update `zod` to 4.x and `zod-openapi` to latest 4.x.
  - Regenerate OpenAPI schemas (`pnpm generate:openapi`).
  - Run unit tests and OpenAPI schema tests.
  - Spot-check docs rendering and Swagger UI.
- Suggested validation:
  - `pnpm test`
  - `pnpm lint`
  - OpenAPI schema test (`__tests__/openapi-schema.test.ts`)

Batch 1: Tooling patch/minor updates
- @babel/* patch bumps (if still needed for schema generation scripts)
- eslint + prettier patch/minor
- typescript patch
- tsx patch
- @types/* patch/minor (lodash, styled-components, pg)

Batch 2: Runtime/library patch/minor updates
- @upstash/ratelimit, @upstash/redis
- superjson
- graphql
- next-hubspot
- swagger-ui-react
- @google-cloud/storage

Batch 3: UI library patch/minor updates
- @oaknational/oak-components patch/minor

Execution checklist (for each batch)
- Update dependencies in `package.json`/lockfile.
- Run `pnpm lint` and `pnpm test`.
- Run a quick smoke test (start dev server, hit `/api/v0/subjects`, `/api/v0/swagger.json`).
- Note any changes in `.agent/summary/analysis/dependency-outdated-analysis.md`.

Notes
- Keep batches small to make rollbacks easy if a regression appears.
- If any patch update behaves unexpectedly, treat it as a v1 candidate and revisit later.
