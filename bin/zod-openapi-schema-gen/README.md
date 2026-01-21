# Generating the OpenAPI - ZOD schema documentation

## Requirements

`trpc-to-openapi` v2.1.5 - this is fixed in the package.json. DO NOT update unless trpc 11 support has been fully integrated and the underlying HTTP handlers use the correct request and responses.

## OpenAPI schema generation
To generate, in the root directory, run `pnpm generate:openapi` to regenerate the schemas. The generated schemas live in:

```
src/lib/zod-openapi/generated/
  └── {handler-folder}/
      └── {endpoint}Request.openapi.ts            # The request Zod schema generated for an endpoint
      └── {endpoint}Response.openapi.ts           # The response Zod schema generated for an endpoint
      ...                                         # Can have multiple sets of these docs depending on endpoints
      └── index.ts                                # Local export
  └── index.ts                                    # Global exports
```

The script will run through all relevant files.

## Handler formats

Each endpoint handler may have multiple endpoints. The handlers are grouped by

```
allKeyStageAndSubjectUnits
assets
changelog
keyStages
keyStageSubjectLessons
lesson
questions
rate
searchTranscripts
sequences
subjects
threads
transcript
units
```

The handlers live inside the `src/lib` folder. The structure is as follows:

```
└── lib...
    └── handlers
        └── (pages)
            ├── allKeyStageAndSubjectUnits
            │   ├── examples
            │   └── schemas
            ├── assets // have many endpoints, so grouped by req /res
            │   ├── examples
            │   │   ├── requests
            │   │   │   └── requestExample.json
            │   │   └── responses
            │   │       └── responseExample.json
            │   ├── schemas
            │   │   ├── requests
            │   │   │   └── request.schema.ts
            │   │   └── responses
            │   │       └── response.schema.ts
            │   ├── helpers.ts
            │   ├── types.ts
            │   └── assets.ts
            └── changelog // only one or two endpoitns
                ├── examples
                │   ├── requestExample.json
                │   └── responseExample.json
                ├── schemas
                │   ├── request.schema.ts
                │   └── response.schema.ts
                └── changelog.ts
```

## Creating a new endpoint / updating an endpoint

First, create two schema files. This should live inside the relevant handler `schema` folder -

1. the Request schema, which contains request parameters,
2. the Response schema, which contains the response object

### Request Schema

The Request schema should be explicitly declared (e.g. no imported schema objects). This is due to the schema generation through the `trpc-to-openapi` library which doesn't generate the document consistently with the response object.

For example,

```ts
// ExampleRequest.schema.ts

// ✅ this is correct
import z from 'zod';

// The name of the export should match the filename exactly, just with `Schema` tacked onto the end.
// Don't forget to export!
export const exampleRequestSchema = z.object({ subject: z.string() });

// ✅ this also works
const subjectSchema = z.string();
export const exampleRequestSchema = z.object({ subject: subjectSchema });

// ❌ this will not generate correctly
// In the Playground, the parameter examples will not display if the below method is used

const subjectSelection = z.object({ subject: z.string() });
export const exampleRequestSchema = subjectSelection;
```

### Response Schema

The response schema can use imports, or an imported Zod object. This is because it doesn't require inline example schemas, whereas the Request object does.

```ts
// ExampleResponse.schema.ts

// ✅ this is correct
import z from 'zod';

// The name of the export should match the filename exactly, just with `Schema` tacked onto the end.
// Don't forget to export!

const subjectSchema = z.object({ subject: z.string() });
export const exampleResponseSchema = z.array(subjectSchema);

// ✅ this also works

import subjectResponse from '.../subjectResponse.ts';

export const exampleResponseSchema = subjectResponse;

// ✅ But also, explicit declaration also is fine.
export const exampleResponseSchema = z.array(z.object({ subject: z.string() }));
```

### Example files

The example files all live in the `handler/examples` folder. If there is a `[Request|Response].schema.ts` file, there MUST be a corresponding JSON example.

e.g.

```
.
└── lib...
    └── handlers
        └── endpoint
            ├── examples
            │   ├── requestExample.json
            │   └── responseExample.json
            ├── schemas
            │   ├── request.schema.ts
            │   └── response.schema.ts
            └── endpointHandler.ts
```

or

```
.
└── lib...
    └── handlers
        └── endpoint
            ├── examples
            │   ├── requestExample.json
            ├── schemas
            │   ├── request.schema.ts
            └── endpointHandler.ts
```

You can explicitly create your own request / response objects in the endpoint handler file, but this is not recommended for consistency.

The only endpoints which use non-generated schemas are:

```
    /changelog
    /rateLimit
    /subjects/{subject}/years
```

### Using the generated objects

Once the files have been generated, they remain unused until imported into the handler file.

```ts
import {
  endpointResponseOpenAPISchema,
  endpointRequestOpenAPISchema,
} from '@/lib/zod-openapi/generated/endpoint';

export const getEndpoint = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/endpoint',
        description: 'Example endpoint',
        errorResponses: [], // keep this in there - the default is overly verbose
      },
    })
    .input(z.void()) // this is valid if requires no inputs
    .input(endpointRequestOpenAPISchema) // Request schema
    .output(endpointResponseOpenAPISchema), // Response schema
  //...
});
```
