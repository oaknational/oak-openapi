# Safe change checklist

Purpose
- Provide a quick checklist before opening a PR.

Checklist
- The change is scoped and described in the PR summary.
- `pnpm lint` and `pnpm test` were run for runtime changes.
- `pnpm generate:openapi` was run if request/response schemas changed.
- `pnpm build-subjects` was run if subject/key stage lists changed.
- Docs updated if behavior or usage changed.
- API examples updated if output shape changed.

Related docs
- [docs/engineering/working-on-repo.md](docs/engineering/working-on-repo.md)
