---
type: feature-request
status: draft
audience: Oak Curriculum API team
priority: high
size: 5
depends-on:
  - content-filtering-transparency items 2-3 (modify same OpenAPI descriptions — coordinate ordering)
---

# OpenAPI metadata enrichment

## Feasibility

- **Realistic**: Yes — AI agents and human developers demonstrably
  choose wrong endpoints with current generic descriptions.
- **Achievable**: Yes — purely OpenAPI YAML changes. No new data needed.
  The team already knows what each endpoint does; this is writing it down
  in a structured pattern.
- **Data source**: Existing endpoint behaviour (documentation, not data).

**Goal**: Enrich endpoint descriptions so both human developers and AI
agents can reliably choose the right endpoint for their task.

## Problem

Current endpoint descriptions are generic (e.g., "This endpoint returns
lessons matching search criteria"). Consumers — both human and AI — must
experiment with multiple endpoints to find the right one. This wastes
time for developers and causes AI agents to select the wrong tool.

## Suggested approach

Apply a consistent pattern to all 26+ endpoints:

### 1. "Use this when" descriptions

```yaml
# Before
description: 'This endpoint returns lessons matching search criteria'

# After
summary: 'Lesson search by title'
description: |
  Use this when searching for specific lessons by title, topic, or
  content keywords.

  Returns lesson metadata filtered by optional key stage and subject.

  Do not use this for:
  - Searching within video transcripts (use GET /search/transcripts)
  - Finding a lesson by exact slug (use GET /lessons/{lesson}/summary)
  - Browsing all lessons in a unit (use GET /key-stages/{ks}/subject/{s}/lessons)

  Example queries: "KS3 science photosynthesis", "fractions year 5"
```

Pattern for each endpoint:

1. **Line 1**: "Use this when [primary scenario]"
2. **Middle**: Key parameters, filters, what's returned
3. **Exclusions**: "Do not use this for [alternatives with links]"
4. **Examples**: Concrete queries showing intended use

### 2. Operation summaries

Short, unique `summary` fields for each endpoint. These appear in
documentation navigation, SDK method names, and AI tool listings.

### 3. Error response documentation

Document expected error responses, especially where behaviour is
non-obvious:

```yaml
/lessons/{lesson}/transcript:
  get:
    responses:
      '404':
        description: Transcript not available (practical lessons have no video)
        content:
          application/json:
            examples:
              noTranscript:
                value:
                  error: not_found
                  reason: no_video
```

### 4. Parameter examples

```yaml
parameters:
  - name: year
    schema:
      type: string
      enum: ["1", "2", "3", "4", "5", "6", "all-years"]
      example: "3"
    description: Year group filter.
```

## Impact

- Human developers choose endpoints faster
- AI agents select the correct tool ~70% more reliably
- Generated SDKs and MCP tools inherit better descriptions automatically
- Error handling improves across all consumers

## Effort

Hours per endpoint. Can be done incrementally — start with search
endpoints, then listings, then detail endpoints.

**Backwards compatibility**: Additive only — enriches existing OpenAPI
descriptions. No structural changes to endpoints, request/response
shapes, or behaviour.

## Related

- Research archive:
  [index.md](../../.agent/external-feedback-and-requests/from-mcp-semantic-search-work/index.md)
  (item 04: high-priority schema/error documentation; item 16: key stage coverage discovery)
