# Testing and tooling

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Tests
- Vitest is used for unit/integration tests (`__tests__/*`).
- OpenAPI schema validation uses AJV in `__tests__/openapi-schema.test.ts`.
- Load testing config is in `__tests__/load-tests.yml` and run via `pnpm load-test` (Artillery).

Scripts and automation (package.json)
- `pnpm dev`, `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm format`.
- `pnpm build-subjects` regenerates `src/lib/keyStageAndSubjects.json` from live API data.
- `pnpm generate:openapi` runs `bin/zod-openapi-schema-gen/addExamplesToZodSchema.mjs` to regenerate OpenAPI Zod schemas.
- `pnpm gen-zod-from-gql` generates Zod schemas from CMS GraphQL queries.

Storybook
- `pnpm storybook` and `pnpm build-storybook` are configured for UI component development.

Linting and formatting
- ESLint via `next lint .` and Prettier with single quotes.

Dependency maintenance
- Prefer a two-track upgrade plan: v0 for patch/minor updates and v1 for major upgrades; see [.agent/summary/analysis/dependency-outdated-analysis.md](.agent/summary/analysis/dependency-outdated-analysis.md).
