# Release checklist (lightweight)

Use this for any v0 or v1 release‑candidate work.

V0 release checks (stability and trust)
- [ ] Tests: `pnpm test` passes
- [ ] Lint: `pnpm lint` passes
- [ ] OpenAPI generation (if schemas changed): `pnpm generate:openapi`
- [ ] Docs render correctly (docs pages and Swagger UI)
- [ ] Core endpoints smoke test: `/api/v0/subjects`, `/api/v0/swagger.json`, and one asset download
- [ ] Update `.agent/summary` docs if behavior changed

V1 release checks (modernization)
- [ ] All v0 checks
- [ ] Upgrade migration notes recorded (breaking changes, config updates)
- [ ] Targeted regression test for affected area (e.g., CMS, Prisma, Storybook)

Notes
- Keep this checklist short and repeatable; add items only when they become recurring needs.
