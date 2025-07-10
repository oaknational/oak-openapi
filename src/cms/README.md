# CMS Documentation

This directory contains the CMS integration layer for fetching and transforming content from Sanity CMS.

## Structure

### `/queries` Directory

Each query folder contains a standardized set of files for interacting with Sanity CMS:

1. **`.gql` file** - GraphQL query that fetches data from Sanity
2. **`.schema.ts` file** - Zod schema and TypeScript types (generated from the `.gql` file)
3. **`.query.ts` file** - Query execution function that fetches data and validates it

### Query Pattern

Each query follows this pattern:

```typescript
// 1. Import dependencies
import client from '@/cms/client';
import { QuerySchema } from './query.schema';
import query from './query.gql';

// 2. Execute query with type safety
const queryFunction = async (params?: any) => {
  const res = await client.request(query, params);

  // 3. Validate response with Zod schema
  return QuerySchema.parse(res.dataField);
};
```

## Generating Types

When you modify a `.gql` file, regenerate the corresponding schema:

```bash
pnpm gen-zod <file.gql>
```

This generates the `.schema.ts` file with Zod validation schemas and TypeScript types.

## Transform Logic

Some queries include transform functions (e.g., `landingPageTransform.tsx`) that convert raw CMS data into component-ready formats. These transforms typically:

- Parse portable text content into React components
- Extract and format image URLs
- Structure data for specific UI components
- Handle optional fields and fallbacks

## Other Directories

- `/lib` - Shared CMS utilities (client, image helpers)
- `/sanityResolvers` - React components for rendering Sanity content
- `/schemaTypes` - Sanity schema definitions
- `/structure` - Sanity studio structure configuration