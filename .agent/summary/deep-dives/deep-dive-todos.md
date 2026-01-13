# Deep dive TODOs (by focus area)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Use this list to run systematic deep dives and produce consistent reports.

## Standard deep dive checklist (apply to every area)
- Define scope and key questions to answer.
- Map the primary execution flow (diagram + short narrative).
- Identify entrypoints, shared utilities, and dependencies.
- Validate error handling, logging, and telemetry expectations.
- Confirm configuration and env dependencies.
- Check test coverage and note gaps.
- Produce findings split into: high-impact gaps vs optional enhancements.
- Write a report file and update `.agent/summary/analysis/gap-analysis.md` and `.agent/summary/analysis/enhancements.md` if needed.

Report template
- Summary of scope and goals.
- Architecture diagram and flow explanation.
- Key findings (ordered by severity).
- Recommendations and follow-up tasks.
- Evidence list with file references.

---

## 1) API lifecycle + error handling

Todos
- Trace request path from `src/app/api/v0/[...trpc]/route.ts` through `src/lib/context.ts`, `src/lib/protect.ts`, and handler execution.
- Verify CORS and response header behavior, including rate-limit headers on asset routes.
- Review error formatting in `src/lib/trpc.ts` for consistency and security.
- Validate behavior differences between `protectedProcedure` and manual `protect` usage.
- Check `Server-Timing` usage in `src/lib/serverTimings.ts` and where it is set.
- Identify any route methods that should be restricted or are inconsistent.

Deliverable
- `.agent/summary/deep-dives/deep-dive-api-lifecycle.md`

---

## 2) OpenAPI generation + docs coupling

Todos
- Analyze `src/lib/zod-openapi/schema/generateDocument.ts` and how the document is used.
- Verify `src/app/api/v0/swagger.json/route.ts` behavior and immutability of the document object.
- Compare tags and grouping in `src/lib/endpoint-docs/getEndpointDocs.ts` against handler tags.
- Review schema/example generation workflow in `bin/zod-openapi-schema-gen/*` and confirm alignment with handler schemas.
- Validate docs rendering flow in `src/app/(pages)/docs/*` and `src/components/documentationPages/*`.

Deliverable
- `.agent/summary/deep-dives/deep-dive-openapi-docs.md`

---

## 3) Data access safety + consistency

Todos
- Inventory all data sources and access patterns (GraphQL, SQL, Prisma, GCS, Mux).
- Review SQL building in `src/lib/handlers/lesson/lesson.ts` and transcript search in `src/lib/handlers/searchTranscripts/searchTranscripts.ts` for safety.
- Verify GraphQL query patterns and caching, including `currentCycle` usage.
- Check Prisma query ordering and index expectations in `schema.prisma`.
- Confirm error handling and schema validation around external calls.

Deliverable
- `.agent/summary/deep-dives/deep-dive-data-access.md`

---

## 4) Content gating + licensing rules

Todos
- Map gating logic across endpoints and identify where it is applied or missing.
- Review allow/deny lists in `src/lib/queryGateData/*` and `src/lib/blockedContent.ts`.
- Check asset, transcript, and lesson endpoints for consistent gating behavior.
- Document rules and edge cases (units with variants, subjects with ks4 options).
- Propose a centralized policy layer if fragmentation is high.

Deliverable
- `.agent/summary/deep-dives/deep-dive-gating.md`

---

## 5) Bulk download pipeline reliability

Todos
- Review `bin/prepare-bulk.ts` flow and its error handling and retry behavior.
- Analyze asset packing in `src/lib/bulk-data/assets.ts` and storage handling in `src/lib/bulk-data/data-stores.ts`.
- Validate `bin/bulk-download-videos.sh` correctness and failure recovery.
- Assess memory usage tracking and long-running behavior.
- Confirm storage bucket selection and upload behaviors across stages.

Deliverable
- `.agent/summary/deep-dives/deep-dive-bulk-download.md`

---

## 6) Pagination + API consistency

Todos
- Identify all paginated endpoints and document query param defaults.
- Validate `Link` header formation and base URL usage in handlers.
- Check consistency in request/response schema naming and endpoint tags.
- Review subject/sequence slug parsing and error patterns for consistency.

Deliverable
- `.agent/summary/deep-dives/deep-dive-pagination-consistency.md`
