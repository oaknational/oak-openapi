# Dependency update analysis (from pnpm outdated)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Purpose
- Provide a clear, supportive path for dependency maintenance without disrupting v0 stability.

Summary
- There are many patch/minor updates that can be adopted in v0 with low disruption.
- Several major upgrades are available; those are better suited for a v1 track with testing and migration time.

Priority override (V0): Zod 4 + zod-openapi 4.x
- This is a stated high priority even though it is a major upgrade.
- Target: `zod` 4.x and the latest `zod-openapi` 4.x (not 5.x).
- Suggested steps: upgrade, regenerate OpenAPI schemas, run tests, and spot-check docs/Swagger UI.
- Cross-reference: `.agent/summary/analysis/v0-dependency-upgrade-checklist.md`.

V0-friendly updates (patch/minor, lower risk)
These are generally safe to schedule within the v0 stabilization window, assuming tests pass.

- @babel/core 7.28.0 -> 7.28.5
- @babel/generator 7.28.0 -> 7.28.5
- @babel/parser 7.28.0 -> 7.28.5
- @babel/traverse 7.28.0 -> 7.28.5
- @babel/types 7.28.2 -> 7.28.5
- @types/lodash 4.17.20 -> 4.17.21
- @types/styled-components 5.1.34 -> 5.1.36
- @upstash/ratelimit 2.0.6 -> 2.0.7
- next-hubspot 2.0.0 -> 2.0.1
- superjson 2.2.2 -> 2.2.6
- typescript 5.9.2 -> 5.9.3
- @google-cloud/storage 7.16.0 -> 7.18.0
- @types/pg 8.15.5 -> 8.16.0
- @upstash/redis 1.35.3 -> 1.36.0
- eslint 9.33.0 -> 9.39.2
- graphql 16.11.0 -> 16.12.0
- tsx 4.20.3 -> 4.21.0
- swagger-ui-react 5.27.1 -> 5.31.0
- prettier 3.6.2 -> 3.7.4
- prettier-plugin-embed 0.4.15 -> 0.5.1

Notes
- These are still worth a quick smoke test pass, especially for tooling (eslint/prettier/tsx) to avoid surprise formatting changes.

V1 track updates (major or higher-risk)
These are better suited to a v1 plan because they may require code changes or broader testing.

Framework/runtime
- next 15.5.9 -> 16.1.1
- @next/eslint-plugin-next 15.4.6 -> 16.1.1
- eslint-config-next 15.4.6 -> 16.1.1
- react 19.1.1 -> 19.2.3
- react-dom 19.1.1 -> 19.2.3

Data and schema libraries
- @prisma/client 5.22.0 -> 7.2.0
- prisma 5.22.0 -> 7.2.0
- @prisma/extension-accelerate 1.3.0 -> 3.0.1
- graphql-request 6.1.0 -> 7.4.0
- uuid 10.0.0 -> 13.0.0

CMS and content tooling
- sanity 3.99.0 -> 5.1.0
- next-sanity 9.12.3 -> 12.0.5
- @sanity/image-url 1.1.0 -> 2.0.2
- @sanity/vision 3.99.0 -> 5.1.0
- @portabletext/react 3.2.1 -> 6.0.0
- @oaknational/oak-curriculum-schema 1.66.0 -> 2.0.0

Tooling and test ecosystem
- @typescript-eslint/parser 8.39.0 -> 8.51.0
- @typescript-eslint/eslint-plugin 7.18.0 -> 8.51.0
- @commitlint/* 19.8.1 -> 20.2.0
- @storybook/* 8.6.14 -> 10.1.11
- storybook 8.6.14 -> 10.1.11
- @types/node 20.19.10 -> 25.0.3 (large jump; evaluate against Node runtime support)
- @types/react 18.3.23 -> 19.2.7
- @types/react-dom 18.3.7 -> 19.2.3
- @types/archiver 6.0.3 -> 7.0.0
- @types/swagger-ui-react 4.19.0 -> 5.18.0
- @types/uuid 10.0.0 -> 11.0.0
- vitest 1.6.1 -> 4.0.16
- @vitest/coverage-v8 3.2.4 -> 4.0.16
- dotenv-cli 7.4.4 -> 11.0.0
- lint-staged 15.5.2 -> 16.2.7
- vite 5.4.19 -> 7.3.0
- vite-tsconfig-paths 4.3.2 -> 6.0.3
- webpack-bugsnag-plugins 1.9.0 -> 2.2.3
- posthog-js 1.259.0 -> 1.311.0

Pinned or cautionary updates
- trpc-to-openapi 2.1.5 -> 3.1.0: the repo explicitly warns not to update until tRPC 11 integration is complete (see `bin/zod-openapi-schema-gen/README.md`). Treat as V1+ with extra care.

Modernization notes (V1, lower priority)
- Explore a path off Babel for schema generation if a lighter or more modern tool fits.
- Reduce lodash usage by replacing `lodash` with targeted utilities or native equivalents.

Suggested approach
- V0: apply patch/minor updates in small batches, run tests, and document any behavior changes.
- V1: plan major upgrades as coordinated workstreams (framework, data stack, CMS, tooling).
- Maintain a short upgrade log in `.agent/summary/analysis/versioned-improvements.md` so stakeholders can track progress.
- Use `.agent/summary/analysis/v0-dependency-upgrade-checklist.md` and `.agent/summary/analysis/v1-upgrade-roadmap.md` to keep sequencing clear.
