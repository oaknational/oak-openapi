# Next session context prompt

Purpose
- Provide context and pointers for the next session.

Current context
- The public API is v0 (public alpha moving toward public beta).
- V0 fixes focus on correctness and trust; V1 improvements are deeper refactors.
- Docs and analysis have been expanded; use the docs index for navigation.

Key sources (start here)
- `.agent/directives/AGENT.md` (agent guidance and repo rules)
- `docs/README.md` (docs index and start-here links)
- `docs/engineering/v0-v1-improvements.md` (improvement framing)
- `docs/engineering/gap-analysis.md` (high-impact issues)
- `docs/engineering/enhancements.md` (optional improvements)
- `.agent/summary/index.md` (analysis index and deep dives)

External feedback: MCP semantic search work
- Location: `.agent/external-feedback-and-requests/from-mcp-semantic-search-work/`
- Start with the following (but read them all):
  - `index.md`
  - `00-overview-and-known-issues.md`
  - `04-high-priority-requests.md`
  - `05-medium-priority-requests.md`
  - `08-summary-and-coordination.md`
  - Example packs: `10-20-*` files (usage examples and concrete requests)
  - `.agent/external-feedback-and-requests` the readme needs updating


**start with a deep analysis of all relevant documents and code. There is no time pressure, only a need to do an excellent job**

We need a sensible entrypoint to .agent/ focussed on the summary and feedback, aimed at a project manager who wants to understand the current state and potential improvements, in order to refine, prioritise, and organise work.

Ideas for use and transformation
- Extract actions with V0/V1 tags and link to supporting docs.
- Create a concise synthesis doc with cross-references to internal analysis.
- Map external requests to API endpoints and OpenAPI shapes.
- Compare external requests with `gap-analysis.md` to identify overlaps.
- Capture new requirements that affect data shapes and OpenAPI output.
- Use a table: request -> impact -> endpoints -> V0/V1 -> doc links.
- Record unresolved questions and TODOs where clarity is missing.

Operational notes
- Use British English and a supportive tone in docs.
- If a request implies major change, add it to plans rather than directives.
- When duplication is unavoidable, document it and add a follow-up plan item.
