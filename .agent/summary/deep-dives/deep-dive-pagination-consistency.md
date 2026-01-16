# Deep dive: pagination + API consistency

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see `.agent/summary/analysis/versioned-improvements.md` for the split.

Scope
- Pagination behavior and consistency across list endpoints.
- URL generation for `Link` headers and parameter defaults.

Pagination model
- Uses `offset` and `limit` query params for select endpoints.
- `limitSchema` and `offsetSchema` provide defaults and constraints.
  - Defaults: `offset=0`, `limit=10`, `limit <= 100`.
  - Evidence: `src/lib/handlers/commonTypes.ts`.

Endpoints using offset/limit
- `GET /key-stages/{keyStage}/subject/{subject}/lessons`
  - Handler: `src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`.
- `GET /key-stages/{keyStage}/subject/{subject}/questions`
  - Handler: `src/lib/handlers/questions/questions.ts`.
- `GET /sequences/{sequence}/questions`
  - Handler: `src/lib/handlers/questions/questions.ts`.

Link header flow
```
If results == limit
  -> build next URL
  -> set `Link: <next>; rel="next"`
```

Findings (high-impact)
- `Link` header URLs are constructed by concatenating `baseUrl` with `ctx.req.url`, which is already absolute, yielding URLs that are not valid.
  - Evidence: `src/lib/handlers/questions/questions.ts`, `src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`.

Findings (medium)
- `Link` header construction does not currently preserve existing query parameters safely and can produce duplicated query strings.
- Pagination is implemented only on select endpoints; other list endpoints return complete datasets without pagination, which may be large.

Consistency notes
- `offset` and `limit` defaults are consistent via shared schemas.
- Some list endpoints return grouped structures (e.g., by year or unit) while others return flat arrays, which can be unexpected for clients.

Recommendations

V0/V1 alignment
- V0: prioritize fixes that improve correctness, safety, and client trust.
- V1: schedule deeper refactors and enhancements after V0 stability goals are met.

- Build pagination URLs via `new URL(ctx.req.url)` and `searchParams` to avoid double base URLs and malformed query strings.
- Create a shared pagination helper to apply consistent `Link` header generation.
- Consider adding pagination to heavy list endpoints or document why pagination is intentionally absent.

Evidence list
- `src/lib/handlers/commonTypes.ts`
- `src/lib/handlers/keyStageSubjectLessons/keyStageSubjectLessons.ts`
- `src/lib/handlers/questions/questions.ts`
