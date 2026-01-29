# Fast-track architecture orientation (optional)

Purpose
- Provide a quick path to advanced concepts and current system shape.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Who this is for
- Contributors who want a rapid architectural overview without a full onboarding read.
- Returning contributors who want a quick refresh on the current shape.

Fast-track path
1) System boundary and domains: [docs/architecture/system-boundaries.md](docs/architecture/system-boundaries.md).
2) Where concerns live in code: [docs/architecture/architecture-map.md](docs/architecture/architecture-map.md).
3) Request lifecycle and custom routes: [docs/architecture/runtime-architecture.md](docs/architecture/runtime-architecture.md).
4) Infra topology and operational constraints: [docs/architecture/infrastructure-topology.md](docs/architecture/infrastructure-topology.md).
5) Key decisions: [docs/architecture/decision-records/README.md](docs/architecture/decision-records/README.md).
6) V0 vs V1 priorities: [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md).
7) Known gaps and risks: [docs/engineering/gap-analysis.md](docs/engineering/gap-analysis.md).

Quick checks (if you are making changes)
- For API changes, update `src/lib/handlers/*` and run `pnpm generate:openapi`.
- For data source changes, confirm expected behavior in [docs/architecture/data-sources.md](docs/architecture/data-sources.md).
- For gating changes, review [docs/architecture/content-gating.md](docs/architecture/content-gating.md).

For a more thorough introduction
- [docs/engineering/onboarding.md](docs/engineering/onboarding.md)
- [docs/architecture/overview.md](docs/architecture/overview.md)
- [docs/README.md](docs/README.md)
