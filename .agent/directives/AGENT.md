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

## Project context

- **What**: Oak OpenAPI is a Next.js app serving UI pages, API routes, docs, and
  a Swagger playground, plus scripts and infrastructure for bulk exports.
- **Package manager**: pnpm only (no npm/yarn).
- **Repo does not use Turborepo**.

## Directives to read

- [`./rules.md`](./rules.md) for repository rules.
- [`./schema-first-execution.md`](./schema-first-execution.md) for OpenAPI-first guidance.
- [`./testing-strategy.md`](./testing-strategy.md) for testing conventions.

## Essential links

- [`README.md`](../../README.md) (repo overview and quickstart)
- [`docs/README.md`](../../docs/README.md) (docs index and start-here links)
- [`docs/engineering/onboarding.md`](../../docs/engineering/onboarding.md) (local setup)
- [`docs/engineering/v0-v1-improvements.md`](../../docs/engineering/v0-v1-improvements.md) (priority framing)
- [`docs/architecture/README.md`](../../docs/architecture/README.md) (architecture overview)
- [`.agent/summary/index.md`](../summary/index.md) (analysis index and deep dives)

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

## Repo structure (high level)

- `src/app`: Next.js App Router pages and API routes.
- `src/lib`: API handlers, OpenAPI generation, integrations, gating.
- `src/cms`: Sanity CMS integration.
- `src/components`: UI components.
- `bin`: bulk and schema scripts.
- `docs`: architecture and engineering docs.
- `infrastructure`: Terraform for bulk uploader job.
- `__tests__`: tests and load testing config.

## Remember

1. When in doubt, make it simpler.
2. Keep docs and `.env.example` in sync with code changes.
3. If a change is significant or policy-level, add it to the plans.
