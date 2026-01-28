# Upgrade Tracker

## Purpose

Track dependency and modernisation work in small, testable batches.

## References

- Primary plan: [`dependency-upgrades.md`](./dependency-upgrades.md)
- Improvements: [`v0-v1-improvements.md`](./v0-v1-improvements.md)

---

## Completed ✅

### V0 Priority

- [x] Zod 4.x (`zod@4.3.5`)
- [x] zod-openapi 5.x (`zod-openapi@5.4.6`)
- [x] trpc-to-openapi 3.x (`trpc-to-openapi@3.1.0`)

### V1 Toolchain (Done Early)

- [x] Vitest 4.x (`vitest@4.0.16`, `@vitest/coverage-v8@4.0.16`)
- [x] Vite 7.x (`vite@7.3.1`)
- [x] lint-staged 16.x (`lint-staged@16.2.7`)
- [x] uuid 13.x (`uuid@13.0.0`)
- [x] eslint-config-next 16.x (`eslint-config-next@16.1.1`)
- [x] eslint 9.39.x (`eslint@9.39.2`)
- [x] swagger-ui-react 5.31.x (`swagger-ui-react@5.31.0`)

---

## Pending

### V0 Batches (Patch/Minor)

- [ ] Batch 1: Babel tooling updates (7.27 → 7.28)
- [ ] Batch 2: Runtime utilities (prettier, tsx, superjson, typescript)
- [ ] Batch 3: Cloud/API clients (@google-cloud/storage, @upstash/*)

### V1 Upgrades (Major)

- [ ] Framework/runtime: Next.js 16.x, React 19.2.x
- [ ] Data stack: Prisma 7.x, graphql-request 7.x
- [ ] CMS/tooling: Sanity 5.x, next-sanity 12.x, @portabletext/react 6.x
- [ ] Storybook 10.x
- [ ] Modernisation: Babel replacement evaluation, lodash reduction

---

## Notes

- Keep batches small and rollback-friendly.
- Run tests and smoke checks after each batch.
