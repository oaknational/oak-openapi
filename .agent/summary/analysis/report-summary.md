# Deep dive report summary

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Tone note
- This summary highlights risks and improvement opportunities with care and respect for the existing work; the codebase has strong foundations and the notes below aim to help it scale safely and predictably.

What went well
- Clear separation between tRPC handlers and Next.js routing provides a clean API surface.
- Zod/OpenAPI integration is thoughtfully organized and supports strong documentation practices.
- Bulk download tooling covers a complex pipeline with logging, asset packaging, and cloud integration.

Cross-cutting themes
- Consistency: similar behaviors (pagination, gating, headers) are implemented multiple times and can drift.
- Immutability and coupling: shared OpenAPI document state is reused for both docs and swagger output.
- Data source safety: raw SQL construction and multiple SQL endpoints create potentially avoidable risk exposure.

Top opportunities (high-impact)
- Pagination `Link` headers are built from URLs that are not valid, making "next" links unreliable.
- Bulk export output can omit lessons when assets are enabled, and bulk outputs can diverge from API gating rules.
- Swagger JSON route mutates the shared OpenAPI document, which can affect docs rendering.
- Lesson text search builds SQL using user input (would benefit from parameterization).
- Transcript search ordering appears out of order due to ID/slug mismatch.

V0 vs V1 framing
- V0 (critical): prioritize reliability and trust for external users; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the specific fix list.
- V1 (improvements): focus on polish, resilience, and maintainability after v0 stability goals are met.
- Dependency maintenance: patch/minor updates fit well in V0, while major upgrades are best planned for V1; see [.agent/summary/analysis/dependency-outdated-analysis.md](.agent/summary/analysis/dependency-outdated-analysis.md).
- Priority note: upgrade to Zod 4 and the latest zod-openapi 4.x is treated as a V0 priority; modernization work like moving off Babel or reducing lodash is lower priority and fits V1.
- Sequencing aids: [.agent/summary/analysis/v0-dependency-upgrade-checklist.md](.agent/summary/analysis/v0-dependency-upgrade-checklist.md) and [.agent/summary/analysis/v1-upgrade-roadmap.md](.agent/summary/analysis/v1-upgrade-roadmap.md).

Bulk vs API consistency (requested focus)
- Bulk exports can include lesson metadata for subjects/units that the API blocks via gating, which may surprise integrators or raise licensing questions.
- Asset gating is applied only to assets in the bulk flow; lesson metadata is still exported.
- Bulk output shapes (per-sequence JSON + optional JSONL/tar files) do not map 1:1 to API responses (grouped by year/unit or filtered by subject/sequence).
- Recommendation: publish a clear mapping guide and consider aligning gating rules for lesson metadata or explicitly documenting the differences.

Opportunities (optional improvements)
- Create a shared pagination helper and a custom-route wrapper for consistent headers and CORS.
- Add a docs-only OpenAPI view rather than mutating the shared document.
- Standardize SQL access and introduce timeouts/retries for external calls.
- Provide a bulk-to-API mapping guide and lightweight smoke tests for critical endpoints.

Deep-dive reports
- [.agent/summary/deep-dives/deep-dive-api-lifecycle.md](.agent/summary/deep-dives/deep-dive-api-lifecycle.md)
- [.agent/summary/deep-dives/deep-dive-openapi-docs.md](.agent/summary/deep-dives/deep-dive-openapi-docs.md)
- [.agent/summary/deep-dives/deep-dive-data-access.md](.agent/summary/deep-dives/deep-dive-data-access.md)
- [.agent/summary/deep-dives/deep-dive-gating.md](.agent/summary/deep-dives/deep-dive-gating.md)
- [.agent/summary/deep-dives/deep-dive-bulk-download.md](.agent/summary/deep-dives/deep-dive-bulk-download.md)
- [.agent/summary/deep-dives/deep-dive-pagination-consistency.md](.agent/summary/deep-dives/deep-dive-pagination-consistency.md)
