# Gap analysis (high-impact, immediate issues)

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Tags
- area=correctness,trust,bulk,gating
- track=v0
- source=internal
- endpoints=multi

## Summary
These are items that could impact correctness, security, or core workflows in the short term.

## Findings

1) Link header pagination uses a URL that is not valid
- Impact: Clients may not reliably follow `Link: rel="next"` for pagination.
- Where:
  - `src/lib/handlers/questions/questions.ts`
  - `src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`
- Details: `next` is built as `${baseUrl}${ctx.req.url}?offset=...` where `ctx.req.url` is already absolute, producing a double base URL.
- Suggested fix: Build the URL with `new URL(ctx.req.url)` and set `searchParams`, or use relative paths with `baseUrl` once.

2) Transcript search results appear to be ordered incorrectly
- Impact: Search results may not be sorted by relevance, which can reduce usefulness.
- Where: `src/lib/handlers/searchTranscripts/searchTranscripts.ts`
- Details: `ids` is an array of lesson IDs, but sorting uses `ids.indexOf(a.lessonSlug)` which compares IDs to slugs.
- Suggested fix: sort by `ids.indexOf(r.id)` or carry the rank from the search query.

3) Swagger route mutates OpenAPI document in place
- Impact: Docs and endpoint grouping can become unreliable if `/swagger.json` is hit before `/docs`, because tags are removed from the shared object.
- Where: `src/app/api/v0/swagger.json/route.ts`
- Details: The handler removes tags from `openApiDocument` directly rather than working on a clone.
- Suggested fix: deep clone `openApiDocument` before filtering, or build a filtered copy for the response only.

4) Sequence assets ignore `year` filtering
- Impact: `/sequences/{sequence}/assets` can return assets across years even when a year filter is provided.
- Where: `src/lib/handlers/assets/assets.ts`
- Details: The handler notes `// FIXME year was never being used to filter` and does not apply `year`.
- Suggested fix: pass `year` into `sequenceWhere` or filter lesson slugs by year.

5) Bulk video packaging script uses an uninitialized variable
- Impact: The "complete" branch may not tar videos correctly, which can disrupt bulk video outputs.
- Where: `bin/bulk-download-videos.sh`
- Details: `outdir` is referenced before assignment when handling the `complete` sentinel line.
- Suggested fix: set `outdir="out/$dir"` before use or compute the tar command without `outdir`.

6) Lesson text search builds raw SQL from user input
- Impact: This increases exposure to SQL injection or malformed queries against the Hasura SQL endpoint.
- Where: `src/lib/handlers/lesson/lesson.ts` (searchByTextSimilarity)
- Details: Query is built via string concatenation with only basic escaping.
- Suggested fix: use parameterized SQL or a safer query builder API.

7) Asset download route sets rate-limit headers on request headers
- Impact: Rate limit headers are not returned for asset downloads, which reduces client visibility.
- Where: `src/app/api/v0/lessons/[lesson]/assets/[type]/route.ts`
- Details: `ctx.resHeaders` is set to `req.headers`, so any `set()` calls do not affect the response.
- Suggested fix: create a new `Headers` for the response and propagate them to `NextResponse`.

8) Bulk download API accepts GET/HEAD but always parses JSON
- Impact: GET/HEAD requests can throw when `req.json()` is called, which can be surprising for clients.
- Where: `src/app/api/bulk/route.ts`
- Details: Handler exports GET but does not guard method or parse safely.
- Suggested fix: restrict to POST or add method checks before `req.json()`.

9) Content gating rules are fragmented and inconsistent across endpoints
- Impact: Licensing restrictions can be applied unevenly, which may lead to accidental exposure or over-blocking of content.
- Where: `src/lib/queryGate.ts`, `src/lib/queryGateData/*`, `src/lib/blockedContent.ts`, plus handlers for lessons, assets, transcripts, questions, sequences, and units.
- Details: Different endpoints use different allow/deny lists and gating functions, and subject-level blocks differ from asset-level blocks.
- Suggested fix: centralize gating into a single policy layer with explicit precedence.

10) Bulk output JSON may omit lesson data when assets are enabled
- Impact: Bulk JSON output can be incomplete when `INCLUDE_ASSETS=true`, which can make integration harder for bulk data consumers.
- Where: `bin/prepare-bulk.ts`
- Details: In asset mode, lessons are written to `lessons.jsonl` but not added to the `lessons` array used in `{sequence}.json`.
- Suggested fix: either include lessons in `{sequence}.json` or document a single canonical lessons output format.

11) Bulk export and API endpoints can diverge in gating and shape
- Impact: Integrators may see lesson data in bulk exports that they cannot retrieve via the API, which can be confusing or raise licensing questions.
- Where: `bin/prepare-bulk.ts`, `src/lib/queryGate.ts`, `src/lib/handlers/*`
- Details: Bulk export does not apply the same gating rules as the API for lesson metadata, and output shapes are different from API responses.
- Suggested fix: document the differences explicitly or apply consistent gating rules across bulk and API outputs.

External alignment
- See `.agent/summary/analysis/internal-external-crosswalk.md` for overlaps and gaps between internal fixes and external requests.
- External summary tables live in `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/08-summary-and-coordination.md`.
