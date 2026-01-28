# Dependency Upgrades

## Purpose

Track dependency maintenance with a staged, low-risk approach.

## Version Framing

- The public API is **v0** (public alpha moving toward public beta).
- V0 items focus on correctness and trust; V1 items are deeper refinements after v0 stability.

---

## Upgrade Flow

```text
V0: patch/minor updates
  -> run tests + smoke checks
  -> document behaviour changes

V1: major upgrades by ecosystem
  -> plan migrations + deeper testing
```

---

## Completed Upgrades ✅

The following major upgrades have been completed:

### Schema and Validation

| Package | Previous | Current |
|---------|----------|---------|
| zod | 3.x | **4.3.5** |
| zod-openapi | 3.x | **5.4.6** |
| trpc-to-openapi | 2.1.5 | **3.1.0** |

### Test and Build Tooling

| Package | Previous | Current |
|---------|----------|---------|
| vitest | 1.6.1 | **4.0.16** |
| @vitest/coverage-v8 | 3.2.4 | **4.0.16** |
| vite | 5.4.19 | **7.3.1** |
| lint-staged | 15.5.2 | **16.2.7** |
| eslint | 9.33.0 | **9.39.2** |

### Utilities

| Package | Previous | Current |
|---------|----------|---------|
| uuid | 10.0.0 | **13.0.0** |
| swagger-ui-react | 5.27.1 | **5.31.0** |
| eslint-config-next | 15.4.6 | **16.1.1** |

---

## V0-Friendly Updates (Pending)

Low-risk patch/minor updates that can be applied incrementally:

| Package | Current | Target |
|---------|---------|--------|
| @babel/core | 7.27.4 | 7.28.x |
| @babel/generator | 7.27.5 | 7.28.x |
| @babel/parser | 7.27.5 | 7.28.x |
| @babel/traverse | 7.27.4 | 7.28.x |
| @babel/types | 7.27.3 | 7.28.x |
| @google-cloud/storage | 7.14.0 | 7.18.x |
| @upstash/ratelimit | 2.0.5 | 2.0.7 |
| @upstash/redis | 1.30.0 | 1.36.x |
| graphql | 16.11.0 | 16.12.x |
| prettier | 3.4.1 | 3.7.x |
| tsx | 4.19.2 | 4.21.x |
| superjson | 2.2.1 | 2.2.6 |
| typescript | 5.4.5 | 5.9.x |

---

## V1 Track Updates (Pending)

Major upgrades requiring migration planning:

### Framework/Runtime

| Package | Current | Target |
|---------|---------|--------|
| next | 15.3.8 | 16.x |
| @next/eslint-plugin-next | 15.3.3 | 16.x |
| react | 19.1.0 | 19.2.x |
| react-dom | 19.1.0 | 19.2.x |

### Data and Schema Libraries

| Package | Current | Target |
|---------|---------|--------|
| @prisma/client | 5.22.0 | 7.x |
| prisma | 5.21.1 | 7.x |
| @prisma/extension-accelerate | 1.1.0 | 3.x |
| graphql-request | 6.1.0 | 7.x |

### CMS and Content Tooling

| Package | Current | Target |
|---------|---------|--------|
| sanity | 3.88.3 | 5.x |
| next-sanity | 9.x | 12.x |
| @sanity/image-url | 1.1.0 | 2.x |
| @sanity/vision | 3.x | 5.x |
| @portabletext/react | 3.2.1 | 6.x |

### Tooling and Test Ecosystem

| Package | Current | Target |
|---------|---------|--------|
| @storybook/* | 8.6.14 | 10.x |
| storybook | 8.6.14 | 10.x |
| @types/node | 22.x | 25.x |
| @types/react | 18.2.79 | 19.x |
| @types/react-dom | 18.2.25 | 19.x |
| dotenv-cli | 7.4.2 | 11.x |
| vite-tsconfig-paths | 4.3.2 | 6.x |
| posthog-js | 1.172.0 | 1.311.x |

---

## Modernisation Notes (V1, Lower Priority)

- Evaluate a path off Babel for schema generation when suitable.
- Reduce lodash usage by replacing with targeted utilities or native equivalents.

---

## Related Docs

- [`v0-v1-improvements.md`](./v0-v1-improvements.md)
