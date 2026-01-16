# First contribution guide

Purpose
- Provide a safe, step-by-step path for a first change to the repo.

Version framing
- The public API is v0 (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

Option A: Documentation-only change (recommended)
1) Pick a small doc update (typo fix, clarification, or adding an example).
2) Make the change in `docs/` or `README.md`.
3) Run a quick format check: `pnpm format:check`.
4) Open a PR with a short summary and a screenshot if UI docs changed.

Option B: Small code change
1) Pick a small, low-risk change (logging text, doc references, or minor refactor).
2) Make the change in a focused commit.
3) Run `pnpm lint` and `pnpm test` if the change touches runtime code.
4) Update docs if behavior or usage changed.

Definition of done
- Change is small and scoped.
- Tests or lint pass when relevant.
- Docs updated if behavior changed.

Related docs
- `docs/engineering/safe-change-checklist.md`
- `docs/engineering/working-on-repo.md`
