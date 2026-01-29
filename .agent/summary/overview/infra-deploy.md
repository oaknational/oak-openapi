# Infrastructure and deployment

Version framing
- The public API is v0 (public alpha moving toward public beta); prioritize V0 critical fixes first.
- V1 improvements are deeper refinements after v0 stability goals; see [.agent/summary/analysis/versioned-improvements.md](.agent/summary/analysis/versioned-improvements.md) for the split.

Docker
- `Dockerfile` builds a Node 22 image and runs `pnpm bulk` to generate bulk data artifacts.

Terraform
- Terraform configs live in `infrastructure/` (project and bulk-upload modules).
- [infrastructure/bulk-upload/README.md](infrastructure/bulk-upload/README.md) documents release and job execution details.
- [sequence-rules.md](sequence-rules.md) documents subject/category sequencing rules relevant to API behavior.

Vercel and Next.js config
- `next.config.mjs` configures GraphQL loader, styled-components compiler support, image domains, and source maps.
- `vercel.json` enables `Server-Timing` headers on all routes.

CI/CD workflows
- `lint.yml` and `test.yml` run on PRs against `main` with required secrets for GraphQL, Redis, and Prisma.
- `terraform_checks.yml` runs terraform checks on push via oak-terraform-actions.
- `build-bulk-data-image.yml` builds and pushes a bulk-data container image on PRs and releases.
