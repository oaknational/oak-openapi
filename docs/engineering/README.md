# Engineering planning notes

Purpose
- Provide lightweight in-repo structure that complements PM planning in Notion.
- Keep v0/v1 framing visible and connect to the architecture and engineering docs in `docs/`.

Where planning lives
- Primary PM planning and sprint tracking live in Notion.
- This folder holds short, stable reference docs and checklists that support delivery.

Key references
- V0/V1 framing: [docs/engineering/v0-v1-improvements.md](docs/engineering/v0-v1-improvements.md)
- Gap analysis: [docs/engineering/gap-analysis.md](docs/engineering/gap-analysis.md)
- Enhancements: [docs/engineering/enhancements.md](docs/engineering/enhancements.md)
- Dependency tracking: [docs/engineering/dependency-upgrades.md](docs/engineering/dependency-upgrades.md)
- Onboarding: [docs/engineering/onboarding.md](docs/engineering/onboarding.md)
- Working on the repo: [docs/engineering/working-on-repo.md](docs/engineering/working-on-repo.md)
- First contribution: [docs/engineering/first-contribution.md](docs/engineering/first-contribution.md)
- Safe change checklist: [docs/engineering/safe-change-checklist.md](docs/engineering/safe-change-checklist.md)

Milestones and streams (lightweight)
- Milestones are still helpful as simple "finish lines," even for a single developer.
- Suggested milestones: `v0-stabilization`, `zod4-migration`, `v1-modernization`.
- Streams can be very light labels in Notion (e.g., API correctness, bulk pipeline, dependencies) to avoid context switching.
- For the repo, keep streams as references in the summary docs rather than duplicating the PM board.

Milestone checkpoints (high-level, measurable)
- v0-stabilization: all items in [docs/engineering/gap-analysis.md](docs/engineering/gap-analysis.md) are resolved or explicitly deferred.
- zod4-migration: `zod` is on 4.x and `zod-openapi` is on latest 4.x, schemas regenerated, smoke checks pass.
- v1-modernization: major upgrade plan approved and at least one ecosystem track completed (framework, data, CMS, or tooling).

Recommended usage
- Use [sprint-template.md](sprint-template.md) to outline a single sprint goal and scope.
- Use [release-checklist.md](release-checklist.md) for any release-candidate work.
- Use [upgrade-tracker.md](upgrade-tracker.md) to track dependency batches and modernization items.

Related docs
- [README.md](README.md) (repo overview and quickstart)
- [README_BULK_DOWNLOAD.md](README_BULK_DOWNLOAD.md) (bulk download process)
- [src/cms/README.md](src/cms/README.md) (CMS integration)
- [docs/architecture/decision-records/README.md](docs/architecture/decision-records/README.md) (ADRs)
- [docs/architecture/README.md](docs/architecture/README.md) (architecture overview)
- [docs/README.md](docs/README.md) (docs index)
