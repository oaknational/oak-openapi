# V1 upgrade roadmap (by ecosystem)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Purpose
- Provide a grouped roadmap for major upgrades and modernization tasks that benefit from broader testing.
- This roadmap assumes the Zod 4 + zod-openapi 4.x upgrade is handled in the v0 track.

Cross-references
- Full list and grouping: [.agent/summary/analysis/dependency-outdated-analysis.md](.agent/summary/analysis/dependency-outdated-analysis.md).
- V0/V1 split: [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md).
- V0 batching: [.agent/summary/analysis/v0-dependency-upgrade-checklist.md](.agent/summary/analysis/v0-dependency-upgrade-checklist.md).

1) Framework and runtime
- Next.js: 15.x -> 16.x
- React/React DOM: 19.1.x -> 19.2.x
- Related tooling: `@next/eslint-plugin-next`, `eslint-config-next`

2) Data stack and schema tooling
- Prisma: 5.x -> 7.x, including `@prisma/extension-accelerate`
- graphql-request: 6.x -> 7.x
- uuid: 10.x -> 13.x
- Optional follow-on: evaluate zod-openapi 5.x after the zod 4 migration stabilizes

3) CMS and content pipeline
- sanity: 3.x -> 5.x
- next-sanity: 9.x -> 12.x
- @sanity/image-url, @sanity/vision
- @portabletext/react 3.x -> 6.x
- @oaknational/oak-curriculum-schema 1.x -> 2.x

4) Frontend and docs tooling
- storybook: 8.x -> 10.x (+ addons)
- swagger-ui-react types update and compatibility checks

5) Testing and build toolchain
- vitest 1.x -> 4.x (+ coverage plugin)
- vite 5.x -> 7.x and vite-tsconfig-paths 4.x -> 6.x
- eslint ecosystem (`@typescript-eslint/*`) to latest 8.x

6) Modernization (lower priority)
- Replace Babel usage in schema generation scripts with a more modern parser/transformer (e.g., ts-morph or swc), if feasible.
- Reduce lodash usage by replacing `lodash` with targeted utilities or native equivalents; currently used in `src/lib/bulk-data/utils.ts` and `src/components/documentationPages/EndpointBlock.tsx`.
- Consider dependency pruning for any unused packages.

Suggested sequencing
- Start with framework/runtime upgrades, then data stack, then CMS/tooling, to reduce cross‑dependency risk.
- Where possible, isolate each ecosystem upgrade in its own branch and use release notes to guide migration steps.

Success criteria
- Each upgrade track has clear before/after tests and a short migration note.
- Critical user flows (docs, core endpoints, bulk download) remain stable.
