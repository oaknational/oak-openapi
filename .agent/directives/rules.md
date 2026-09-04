# Rules

These rules must be followed for this repository. Where a stricter future
standard is desired, it is recorded in the plans rather than enforced here.

## First question

Always ask: **Could it be simpler without compromising quality?**

## Cardinal rule (data integrity and single source of truth)

Data shapes and the public API contract should flow from the Zod schemas and the
generated OpenAPI output in this repo. Avoid duplicating shapes across handlers,
docs, and bulk outputs; if duplication is unavoidable, document it and add a
follow-up item in the plans.

## Core rules

- Keep changes small and scoped; prefer existing patterns and conventions.
- Use pnpm only; do not introduce new package managers or build tools.
- Update docs when behaviour, API shapes, or environment requirements change.
- If you add a new environment variable, update `.env.example` and relevant docs.
- Avoid creating parallel versions of files; use git history instead.
- Remove unused code or unused exports when you touch the area.
- Do not disable quality gates (lint/test/format) without explicit agreement.

## Coding conventions

- Follow Next.js App Router patterns for pages and API routes.
- Use functional components and hooks for React UI work.
- Prefer `TRPCError` for API error handling where applicable.
- Prefer single quotes (Prettier enforces this).
- Use async/await for asynchronous logic.
- Use conventional commit messages (commitlint is enforced). A lower-case scope
  from the enum in `commitlint.config.ts` is **required** on every commit.
- Scope API-affecting work `api` — only `feat(api)`, `fix(api)`, `perf(api)` and
  `revert(api)` release a new version. Everything else deploys but does not move
  the version or reach the changelog, so a mis-scoped API change ships
  unannounced. When in doubt, scope it `api`.
- Keep the commit subject line to 100 characters or fewer, and wrap body and
  footer lines at 100 (commitlint exempts a single unbreakable URL that alone
  exceeds the limit). If a generated body has over-long lines, rewrite the body
  to comply rather than disabling the check.
- Do not edit `src/lib/version.ts` or `package.json`'s `version` by hand;
  semantic-release owns them.
- See [`docs/RELEASING.md`](../../docs/RELEASING.md) before changing
  `.releaserc.json` — rule order and `parserOpts` there have silent failure
  modes.
- Prefer explicit typing and avoid `any` where practical.

## Testing guidance

- Prefer tests when changing behaviour or fixing bugs.
- Keep tests focused on behaviour, not implementation details.
- Use simple fakes or fixtures rather than complex mocks.
- If a test is flaky or obsolete, fix or remove it rather than skipping it.

## Documentation and onboarding

- Keep the onboarding path coherent ([`README.md`](../../README.md) -> [`docs/README.md`](../../docs/README.md) -> deeper docs).
- Update `docs/architecture/*` when architecture or boundaries change.
- Use progressive disclosure: start broad, then link to detail.
