# Docs Index

Purpose
- Provide stable, repo-local documentation that complements the README and engineering notes.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Start here
- New to the repo: `docs/engineering/onboarding.md`
- New to the architecture: `docs/architecture/overview.md`
- Want to make a first change: `docs/engineering/first-contribution.md`
- Need to use the API: `docs/api/quickstart.md`
- Want a fast-track architecture refresher: `docs/architecture/fast-track-orientation.md`

Architecture
- `docs/architecture/README.md`: architecture overview and index.
- `docs/architecture/overview.md`: system boundary, core components, and high-level diagram.
- `docs/architecture/fast-track-orientation.md`: optional rapid orientation for advanced concepts.
- `docs/architecture/system-boundaries.md`: scope, boundaries, and domains.
- `docs/architecture/architecture-map.md`: concerns mapped to code locations.
- `docs/architecture/runtime-architecture.md`: request lifecycle, auth, headers, and runtime flows.
- `docs/architecture/data-sources.md`: integrations and data contracts.
- `docs/architecture/infrastructure-topology.md`: hosting, dependencies, and operational constraints.
- `docs/architecture/openapi-generation.md`: OpenAPI generation and docs coupling.
- `docs/architecture/content-gating.md`: licensing and gating rules.
- `docs/architecture/bulk-download.md`: bulk pipeline, outputs, and alignment notes.
- `docs/architecture/decision-records/README.md`: ADRs and template.

API
- `docs/api/README.md`: API docs index.
- `docs/api/quickstart.md`: authentication and sample requests.

Operations
- `docs/operations/README.md`: operations docs index.
- `docs/operations/environments.md`: environment notes and config (placeholder).
- `docs/operations/runbook.md`: runbook and incident basics (placeholder).

Engineering
- `docs/engineering/README.md`: planning notes and repo processes.
- `docs/engineering/onboarding.md`: local setup and common tasks.
- `docs/engineering/working-on-repo.md`: workflow, codegen, and tests.
- `docs/engineering/first-contribution.md`: safe first change path.
- `docs/engineering/safe-change-checklist.md`: pre-PR checklist.
- `docs/engineering/v0-v1-improvements.md`: V0 fixes vs V1 improvements.
- `docs/engineering/gap-analysis.md`: high-impact issues and suggested fixes.
- `docs/engineering/enhancements.md`: optional improvements.
- `docs/engineering/dependency-upgrades.md`: dependency plan with V0/V1 split.
- `docs/engineering/release-checklist.md`: lightweight release checks.
- `docs/engineering/upgrade-tracker.md`: upgrade tracking.
- `docs/engineering/sprint-template.md`: sprint outline.

Related docs
- `README.md` (repo overview and quickstart)
- `README_BULK_DOWNLOAD.md` (bulk pipeline guide)
- `src/cms/README.md` (CMS integration)
- `docs/glossary.md` (domain terms)
