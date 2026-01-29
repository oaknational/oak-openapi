# Working on the repo

Purpose
- Explain how to make changes, run common tasks, and keep docs/code in sync.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Daily workflow (simple view)
```text
Change -> run checks -> update docs -> open PR
```

Local commands
- Start dev server: `pnpm dev` (defaults to port 2727).
- Run tests: `pnpm test`.
- Lint: `pnpm lint`.
- Format check: `pnpm format:check`.
- Format files: `pnpm format`.

Code generation
- OpenAPI schemas: `pnpm generate:openapi`.
- Subjects and key stages: `pnpm build-subjects`.
- Zod from GraphQL (rare): `pnpm gen-zod-from-gql`.

Adding or changing an endpoint
1) Update handler logic in `src/lib/handlers/*`.
2) Update router wiring in `src/lib/router.ts`.
3) Update or add request/response schemas (generated schemas if needed).
4) Run `pnpm generate:openapi`.
5) Update docs or examples if behavior changed.

Docs changes
- API docs and OpenAPI: `docs/api/*` and [docs/architecture/openapi-generation.md](docs/architecture/openapi-generation.md).
- Architecture docs: `docs/architecture/*`.
- Engineering docs: `docs/engineering/*`.
- CMS content: `src/cms/*` and `src/app/(pages)/docs/*`.

Commit conventions
- Commit messages should be Conventional Commits when commitlint is enforced.

Related docs
- [docs/engineering/safe-change-checklist.md](docs/engineering/safe-change-checklist.md)
- [docs/engineering/first-contribution.md](docs/engineering/first-contribution.md)
- [docs/architecture/architecture-map.md](docs/architecture/architecture-map.md)
