# Index

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

**Overview**
- `.agent/summary/overview/overview.md`: purpose, repo layout, and high-level system summary.
- `.agent/summary/overview/runtime-architecture.md`: request flow, Next.js app/API routing, tRPC, OpenAPI generation.
- `.agent/summary/overview/api-handlers.md`: endpoint groups, behaviors, and pagination/gating patterns.
- `.agent/summary/overview/data-sources.md`: databases, external services, and integration points.
- `.agent/summary/overview/security-auth.md`: API key lifecycle, rate limiting, admin auth, and CORS/logging.
- `.agent/summary/overview/bulk-download.md`: bulk data pipeline, asset packaging, and download API.
- `.agent/summary/overview/cms-and-docs.md`: Sanity CMS integration and documentation rendering flow.
- `.agent/summary/overview/frontend-ui.md`: App Router pages and major UI components.
- `.agent/summary/overview/testing-and-tooling.md`: tests, scripts, lint/format, schema generation.
- `.agent/summary/overview/infra-deploy.md`: Docker, Terraform, Vercel config, CI workflows.

**Deep Dives**
- `.agent/summary/deep-dives/deep-dive.md`: instructions, diagrams, explanations, and examples.
- `.agent/summary/deep-dives/deep-dive-todos.md`: todo list for detailed deep dives and reporting.
- `.agent/summary/deep-dives/deep-dive-api-lifecycle.md`: API lifecycle, auth, headers, and error handling.
- `.agent/summary/deep-dives/deep-dive-openapi-docs.md`: OpenAPI generation and documentation coupling.
- `.agent/summary/deep-dives/deep-dive-data-access.md`: data source inventory and query safety review.
- `.agent/summary/deep-dives/deep-dive-gating.md`: content gating/licensing rules and consistency.
- `.agent/summary/deep-dives/deep-dive-bulk-download.md`: bulk download pipeline reliability.
- `.agent/summary/deep-dives/deep-dive-pagination-consistency.md`: pagination behavior and API consistency.

**Analysis**
- `.agent/summary/analysis/report-summary.md`: roll-up of key findings and cross-cutting themes.
- `.agent/summary/analysis/gap-analysis.md`: high-impact, immediate issues with suggested fixes.
- `.agent/summary/analysis/enhancements.md`: optional improvements and longer-term ideas.
- `.agent/summary/analysis/versioned-improvements.md`: V0 critical fixes vs V1 improvements.
- `.agent/summary/analysis/architecture-visibility-roadmap.md`: implicit vs explicit architecture and target-state documentation.
- `.agent/summary/analysis/dependency-outdated-analysis.md`: dependency updates grouped into V0-safe vs V1-track changes.
- `.agent/summary/analysis/v0-dependency-upgrade-checklist.md`: staged v0 upgrade batches and checks.
- `.agent/summary/analysis/v1-upgrade-roadmap.md`: v1 upgrade roadmap by ecosystem.

**Guides**
- `.agent/summary/guides/bulk-api-mapping-guide.md`: mapping between bulk outputs and API endpoints.
- `.agent/summary/guides/bulk-api-alignment-plan.md`: phased plan to align bulk exports with API behavior.
