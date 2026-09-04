<!--
Pull requests are accepted from the Oak internal engineering team only.
If you are outside Oak, please send feedback through the form in CONTRIBUTING.md.
-->

## What does this change?

<!-- One or two sentences. What behaviour is different after this merges? -->

## Why?

<!-- Link the ticket, incident or feedback that prompted it. -->

## How to check it

<!-- The commands or requests a reviewer should run to see it working. -->

## Checklist

- [ ] Commit messages follow Conventional Commits, and the scope is right —
      `feat(api):` / `fix(api):` trigger a release, other scopes do not
- [ ] `pnpm lint`, `pnpm format:check` and `pnpm test` pass locally
- [ ] Request/response changes were made in the Zod schemas, not in generated output
- [ ] [docs/ENDPOINTS.md](../docs/ENDPOINTS.md) updated if an endpoint was added, removed or changed
- [ ] Docs and `.env.example` updated if this changes setup or configuration
- [ ] No secrets, credentials or personal data added to the repository

## Breaking change?

<!-- The public API is v0. If this breaks a consumer, say so here and explain
     the migration, and use a `!` in the commit subject. -->
