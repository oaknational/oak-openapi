import {
  getLatestVersion,
  getLatestMajorVersion,
} from '~/lib/handlers/changelog';
import router from '~/lib/router';

import { OpenAPIV3 } from 'openapi-types';
import { generateOpenApiDocument } from 'trpc-to-openapi';
import { baseUrl } from '~/lib/baseUrl';
import { NextResponse } from 'next/server';

const version = getLatestVersion(getLatestMajorVersion());

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
  bearerFormat: 'JWT', // Optional, only if you want to specify the token format
} as const;

export const openApiDocument = generateOpenApiDocument(router, {
  title: 'Oak OpenAPI',
  version: process.env.VERCEL_GIT_COMMIT_SHA
    ? `${version}-${process.env.VERCEL_GIT_COMMIT_SHA}`
    : version,
  baseUrl,
  docsUrl: baseUrl + '/swagger.json',
  securitySchemes: {
    bearerAuth,
  },
});

// trpc-openapi doesn't support adding security schemes to the generated document yet through their method
// so I'm attaching these directly (which fixes the problem) - just not sure why it's supposed to be an
// empty array
openApiDocument.security = [{ bearerAuth: [] }];

// note that the trpc-openapi module doesn't quite make this compatible with GPT
// so I'm going to re-work the schema returned by this endpoint to make it compatible

// function camelCase(str: string, lcFirst = false): string {
//   const res = str
//     .split(/[^a-z0-9]+/i)
//     .filter(Boolean)
//     .map((_: string) => _[0].toUpperCase() + _.slice(1))
//     .join('');

//   if (!lcFirst) {
//     return res;
//   }

//   return res[0]?.toLowerCase() + res.slice(1);
// }

// sort the paths, because it's a nice thing to do
// openApiDocument.paths = Object.keys(openApiDocument.paths)
//   .sort((a, b) => {
//     return a.localeCompare(b);
//   })
//   .reduce((result, key) => {
//     result[key] = openApiDocument.paths[key];
//     return result;
//   }, {} as OpenAPIV3.PathsObject);

// Object.keys(openApiDocument.paths).forEach((_) => {
//   const path = openApiDocument.paths[_];

//   if (path === undefined) {
//     return;
//   }

//   for (const method of httpMethods) {
//     const root = path[method];

//     if (!root) {
//       continue;
//     }

//     if (root.operationId) {
//       // the dash in the operationId is causing problems with openai's GPT -
//       // resulting in the GPT service not being able to parse the path or method
//       root.operationId = camelCase(root.operationId.replace(/-/g, ' '), true);
//     }

//     const responseObject = root.responses;

//     const id = camelCase(_);

//     Object.keys(responseObject).map((code: string) => {
//       const responseId = `${id}Response${code}`;
//       const response = responseObject[code];

//       if (!response) {
//         return;
//       }

//       // Weird test because TypeScript doesn't handle `if (response.$ref)`
//       if ('$ref' in response) {
//         // skip existing references
//         return;
//       }

//       if (!response.content) {
//         return;
//       }

//       const schema = response.content['application/json']?.schema;

//       if (!schema) {
//         return;
//       }

//       if (response.content['application/json']) {
//         response.content['application/json'].schema = {
//           $ref: `#/components/schemas/${id}`,
//         };
//       }

//       if (!openApiDocument.components) {
//         openApiDocument.components = {};
//       }

//       if (!openApiDocument.components.schemas) {
//         openApiDocument.components.schemas = {};
//       }

//       if (!openApiDocument.components.responses) {
//         openApiDocument.components.responses = {};
//       }

//       openApiDocument.components.schemas[id] = schema;
//       openApiDocument.components.responses[responseId] = response;
//       responseObject[code] = { $ref: `#/components/responses/${responseId}` };
//     });
//   }
// });

export async function GET() {
  return NextResponse.json(openApiDocument);
}
