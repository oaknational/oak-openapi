# AGENT.md

This file provides core directives for AI agents working with this codebase.
Read ALL of it first, then follow all instructions.

## Language and tone

- Use British English spelling, grammar, and UK date/time formats.

## First question

Always apply the first question: **Could it be simpler without compromising quality?**

## Planning work only

Read the metacognitive prompt in [`./metacognition.md`](./metacognition.md) and reflect before planning.

## Cardinal rule (data integrity and single source of truth)

Data shapes and the public API contract should flow from the Zod schemas and the
generated OpenAPI output in this repo. Avoid duplicating shapes across handlers,
docs, and bulk outputs; if duplication is unavoidable, document it and add a
follow-up item in the plans.

## Resolver and view names

- Do not hard-code Hasura resolver or materialised view names in tests or runtime
  code when a constant exists in `src/lib/owaClient.ts`.
- Always import and use the relevant `owaClient` constant for mocked response
  keys and query-string assertions.

When API endpoints are added, removed, or changed, update [docs/ENDPOINTS.md](../../docs/ENDPOINTS.md) in the same task.

## Project context

- **What**: Oak OpenAPI is a Next.js app serving UI pages, API routes, docs, and
  a Swagger playground, plus scripts and infrastructure for bulk exports.
- **Package manager**: pnpm only (no npm/yarn).
- **Repo does not use Turborepo**.

## Directives to read

- [`./rules.md`](./rules.md) for repository rules.
- [`./schema-first-execution.md`](./schema-first-execution.md) for OpenAPI-first guidance.
- [`./testing-strategy.md`](./testing-strategy.md) for testing conventions.

## Development commands

From the repo root (pnpm only):

```bash
pnpm install          # setup
pnpm dev              # run local server (port 2727)
pnpm build            # build
pnpm lint             # lint
pnpm format:check     # format check
pnpm format           # format files
pnpm test             # tests
pnpm test:vscode      # tests in VSCode
pnpm build-subjects   # regenerate key stage/subject list
pnpm generate:openapi # regenerate OpenAPI schemas
pnpm bulk             # run bulk export
pnpm load-test        # load tests (Artillery)
```

Single test example:

```bash
pnpm test --testNamePattern="test name"
```

## Remember

1. When in doubt, make it simpler.
2. Keep docs and `.env.example` in sync with code changes.
3. If a change is significant or policy-level, add it to the plans.

## Schema changes

Run `pnpm generate:openapi` after changing a handler's request or response
schema. Do not edit generated schemas by hand.
