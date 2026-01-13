# CMS and documentation

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Sanity CMS integration
- `src/cms` contains Sanity client setup, schema types, and query helpers.
- Query folders follow a consistent pattern: `.gql` query, `.schema.ts` zod schema, and `.query.ts` execution wrapper.
- `bin/zod-from-gql.ts` generates Zod schemas from GraphQL queries (used for CMS schema regeneration).

Docs pages
- Docs landing and content are rendered via `src/app/(pages)/docs/*` and `src/components/documentationPages/*`.
- Navigation data is pulled with `navDocsListQuery` and used by `DocsLayout`.
- Individual docs pages fetch CMS data with `documentationBySlugQuery` and augment with endpoint metadata from OpenAPI.

Endpoint documentation
- `src/lib/endpoint-docs/getEndpointDocs.ts` reads `openApiDocument` and builds endpoint blocks grouped by tag.
- Output descriptions are enriched using `src/lib/endpoint-docs/outputDescriptions.json`.
- Swagger UI playground loads the OpenAPI document from `/api/v0/swagger.json`.
