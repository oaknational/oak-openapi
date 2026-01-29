# Upgrade tracker (v0/v1)

Purpose
- Track dependency and modernization work in small, testable batches.

References
- Primary plan: [docs/engineering/dependency-upgrades.md](docs/engineering/dependency-upgrades.md)
- Deep background:
  - [.agent/summary/analysis/v0-dependency-upgrade-checklist.md](.agent/summary/analysis/v0-dependency-upgrade-checklist.md)
  - [.agent/summary/analysis/v1-upgrade-roadmap.md](.agent/summary/analysis/v1-upgrade-roadmap.md)
  - [.agent/summary/analysis/dependency-outdated-analysis.md](.agent/summary/analysis/dependency-outdated-analysis.md)

V0 priority (requested)
- [ ] Zod 4 + latest zod-openapi 4.x (regenerate schemas + tests)

V0 batches (patch/minor)
- [ ] Batch 1: tooling patch/minor updates
- [ ] Batch 2: runtime/library patch/minor updates
- [ ] Batch 3: UI library patch/minor updates

V1 upgrades (major)
- [ ] Framework/runtime (Next 16, React 19.2)
- [ ] Data stack (Prisma 7, graphql-request 7, uuid 13)
- [ ] CMS/tooling (Sanity 5, next-sanity 12, portabletext 6)
- [ ] Toolchain (Vitest 4, Vite 7, Storybook 10)
- [ ] Modernization: Babel replacement and lodash reduction

Notes
- Keep batches small and rollback-friendly.
