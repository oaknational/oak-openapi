---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
---

# Curriculum model endpoint

## Feasibility

- **Realistic**: Yes - downstream MCP clients and AI integrations need a stable,
  machine-readable curriculum model payload for orientation before they call
  content endpoints.
- **Achievable**: Yes - the model already exists as a structured JSON artifact in
  this repo and is currently exposed by MCP tooling; this request is to expose
  the same concept from the upstream API.
- **Data source**:
  - `docs/requests/feature-requests/oak-mcp-curriculum-model.json`
  - Existing API/OpenAPI domain entities (subjects, key stages, sequences,
    threads, endpoint capabilities)

**Goal**: Construct and expose a first-class curriculum model payload from the
upstream API so consumers can retrieve this metadata directly from API contract
surfaces, not only MCP server logic.

## Problem

The current curriculum model payload is available in MCP context, but not as an
explicit upstream API endpoint. This creates drift risk:

1. API evolves independently of MCP-curated model payloads.
2. Consumers that do not use MCP cannot retrieve the same model.
3. AI and non-AI clients lack one authoritative orientation endpoint.

## Evidence

- **Artifact proof**:
  [`oak-mcp-curriculum-model.json`](./oak-mcp-curriculum-model.json) already defines
  a rich model including `domainModel`, `toolGuidance`, `workflows`,
  `idFormats`, `canonicalUrls`, and `propertyGraph`.
- **Generator code proof (GitHub)**:
  - composition entrypoint:
    [curriculum-model-data.ts](https://github.com/oaknational/oak-mcp-ecosystem/blob/main/packages/sdks/oak-curriculum-sdk/src/mcp/curriculum-model-data.ts)
  - ontology payload source:
    [ontology-data.ts](https://github.com/oaknational/oak-mcp-ecosystem/blob/main/packages/sdks/oak-curriculum-sdk/src/mcp/ontology-data.ts)
  - supporting graph vocabulary under SDK codegen:
    [property-graph-data.ts](https://github.com/oaknational/oak-mcp-ecosystem/blob/main/packages/sdks/oak-sdk-codegen/src/mcp/property-graph-data.ts)
- **Live behaviour proof**:
  oak-prod currently exposes this concept via `get-curriculum-model`, proving the
  payload shape is useful and already operational for clients.
- **Current gap**:
  there is no corresponding upstream OpenAPI endpoint that guarantees this model
  as part of the core API contract.

## Suggested approach / Expected behaviour

- Add an upstream endpoint (for example `GET /curriculum/model`) returning the
  curriculum model payload.
- Define a schema for the payload in OpenAPI and version it explicitly.
- Build payload generation from source-of-truth API/domain metadata at build time
  where possible, rather than maintaining a hand-edited static document.
- Include `generatedAt`, model version, and compatibility notes in the response.

## Impact

- Single source of truth for orientation metadata across API, SDK, and MCP.
- Reduces contract drift between upstream API behaviour and MCP exposure.
- Improves onboarding for integrators building search, navigation, and AI tools.

**Backwards compatibility**: Additive only - new endpoint with a versioned
response schema.

## Related

- [openapi-metadata-enrichment.md](openapi-metadata-enrichment.md)
- [programme-variants-and-identifiers.md](programme-variants-and-identifiers.md)
- [thread-metadata-enhancements.md](thread-metadata-enhancements.md)
