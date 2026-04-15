# CLAUDE.md

Read [AGENT.md](.agent/directives/AGENT.md) before starting any task.

## Schema changes

`pnpm generate:openapi` is currently broken and must not be run. Until it's
fixed in a separate task, when a handler's request or response shape changes
you must update **both**:

- the source schemas under `src/lib/handlers/<handler>/schemas/*.ts`, and
- the generated schemas under `src/lib/zod-openapi/generated/<handler>/*.ts`.

Keep the two files in sync by hand.
