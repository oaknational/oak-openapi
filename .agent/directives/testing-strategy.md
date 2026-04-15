# Testing and development strategy

## Tooling (current)

- Vitest (unit and integration tests)
- Artillery (load testing via `pnpm load-test`)

## Philosophy

- Prefer testing behaviour over implementation details.
- Prefer smaller tests where possible; use integration tests for cross-module logic.
- Use simple fakes or fixtures; avoid complex mocks.
- Use TDD where practical, but do not block necessary fixes if tests must follow.

## Test types (lightweight definitions)

- Unit tests: focus on a single function or module.
- Integration tests: validate a small set of units working together.
- E2E/Smoke: validate running behaviour (used sparingly due to cost and setup).

## Practical guidance

- Add or update tests when changing behaviour or fixing bugs.
- Avoid flaky tests; fix or remove them rather than skipping.
- If a test needs external services, document the setup in the test or a README.
- Keep load tests separate from unit/integration tests.

