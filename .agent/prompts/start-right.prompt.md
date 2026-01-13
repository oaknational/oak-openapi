Read the foundation documents:
[`.agent/directives/rules.md`](../directives/rules.md), [`.agent/directives/testing-strategy.md`](../directives/testing-strategy.md), and
[`.agent/directives/schema-first-execution.md`](../directives/schema-first-execution.md). Commit to excellence.

Step back before diving in. Ask: are we solving the right problem, at the right
layer, for the right users? Identify assumptions and claims and challenge them early.
Any plan should include brief checkpoints to re-read the core directives.

Aim for clear, maintainable changes that improve long-term understanding. Choose architectural correctness over short-term expediency.

OpenAPI-first rule: the API contract flows from Zod schemas, changes must be made via generator files, never edit the generated files. Regenerate with
`pnpm generate:openapi`.

If you are working with generated output, review the generator or script that
produces it (for OpenAPI, see `bin/zod-openapi-schema-gen/*`).

Run quality gates after changes.

Always ask: what impact are we trying to create for which users?

Do not assume the initial step. Confirm the right starting point with the user.

```shell
# Common commands (repo root), including quality gates.
pnpm install
pnpm dev
pnpm build
pnpm lint
pnpm format:check
pnpm format
pnpm test
pnpm test:vscode
pnpm build-subjects
pnpm generate:openapi
pnpm bulk
pnpm load-test
```
