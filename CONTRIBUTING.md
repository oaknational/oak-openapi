# Contributing

Thank you for taking an interest in the Oak Curriculum API. This repository
is published so that anyone using the API can read the code behind it, but the
ways to contribute differ depending on whether you work at Oak National Academy.

## Are pull requests accepted?

**Not from outside Oak National Academy.** Pull requests are only accepted from
the Oak internal engineering team. The API backs a production service with
access to Oak's content systems, so changes have to go through Oak's internal
review and release process.

We are not able to review or merge external pull requests, and we would rather
say so plainly than leave one sitting unanswered.

## What feedback is most useful

We very much want to hear from people using the API. The most useful things you
can tell us are:

- **Bugs** — an endpoint returning the wrong data, an unexpected error, a
  response that does not match the OpenAPI schema. Include the request URL, the
  response you got, and what you expected.
- **Data problems** — a lesson, unit or subject that looks wrong, incomplete or
  out of date.
- **Gaps** — data you need that the API does not currently expose, and what you
  are trying to build with it.
- **Documentation that is wrong or unclear** — including anything in this
  repository or on the playground.
- **Accessibility barriers** in the published documentation or playground. See
  [docs/accessibility.md](docs/accessibility.md).

## How to send feedback

Use the API feedback form:

**https://bvumd.share.hsforms.com/2nacebr1eQuKMoA-vGpkjCA**

GitHub issues are turned off on this repository, so the form is the route that
reaches the team. See [SUPPORT.md](SUPPORT.md) for what is in scope and how
quickly you can expect a reply.

**Do not report security vulnerabilities through the form.** Follow
[SECURITY.md](SECURITY.md) instead.

## Code of conduct

Everyone interacting with this project, including through the feedback form, is
expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## For Oak engineers

If you work at Oak, the working notes for this repository are in
[docs/README.md](docs/README.md), and the release process is in
[docs/RELEASING.md](docs/RELEASING.md). In short:

1. Branch from `main`.
2. Commits follow [Conventional Commits](https://www.conventionalcommits.org/).
   The scope decides whether a change is released — see `.releaserc.json` —
   so `feat(api):` and `fix(api):` trigger a release and other scopes do not.
   `commitlint` enforces this locally and in CI. Keep the subject line to 100
   characters or fewer, and wrap body and footer lines at 100 (a single
   unbreakable URL that alone exceeds the limit is allowed). See
   [`commitlint.config.ts`](commitlint.config.ts) for the enforced rules.
3. Run `pnpm lint`, `pnpm format:check` and `pnpm test` before pushing. The
   pre-commit hook runs the same commands CI does.
4. Open a pull request against `main`. It needs a passing build and an
   approving review before it can merge.
5. If you add, remove or change an endpoint, update
   [docs/ENDPOINTS.md](docs/ENDPOINTS.md) in the same pull request.

Request and response shapes come from the Zod schemas in each handler's
`schemas/` directory; the OpenAPI document is generated from them at runtime.
Change the schema, not the generated output.
