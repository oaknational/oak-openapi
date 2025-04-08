# CLAUDE.md - Guide for Oak OpenAPI Codebase

## Build & Development
- Build: `pnpm build` (next build)
- Start dev server: `pnpm dev` (port 2727)
- Build subjects: `pnpm build-subjects`

## Linting & Formatting
- Lint: `pnpm lint`
- Check formatting: `pnpm format:check`
- Fix formatting: `pnpm format`

## Testing
- Run all tests: `pnpm test`
- Run single test: `pnpm test --testNamePattern="test name"`
- Debug in VSCode: `pnpm test:vscode`

## Code Style
- TypeScript with strict typing, `any` is not allowed
- Use functional components with hooks for React
- Follow Next.js patterns for pages and API routes
- Use conventional commits (feat:, fix:, chore:, etc.)
- Prefer single quotes for strings
- Use async/await for async operations
- Error handling: use trpc error handling patterns
- Use proper typing for all functions and variables