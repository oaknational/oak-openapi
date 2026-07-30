import { baseUrl } from '@/lib/baseUrl';
import router from '@/lib/router';
import {
  getLatestVersion,
  getLatestMajorVersion,
} from '@/lib/handlers/changelog/helpers';

import { generateOpenApiDocument } from 'trpc-to-openapi';

import { applyRequestMetadata } from './requestMetadata';

const version = getLatestVersion(getLatestMajorVersion());

const bearerAuth = {
  type: 'http',
  scheme: 'bearer',
} as const;

// trpc-to-openapi rebuilds query parameters from the input schema's shape,
// which loses the descriptions and cross-field rules declared on it, so we copy
// them back onto the document afterwards.
export const openApiDocument = applyRequestMetadata(
  generateOpenApiDocument(router, {
    title: 'Oak OpenAPI',
    version: process.env.VERCEL_GIT_COMMIT_SHA
      ? `${version}-${process.env.VERCEL_GIT_COMMIT_SHA}`
      : version,
    baseUrl,
    docsUrl: baseUrl + '/swagger.json',
    securitySchemes: {
      bearerAuth,
    },
    tags: [
      'internal',
      'lists',
      'assets',
      'lessons',
      'questions',
      'units',
      'search',
      'sequences',
      'programmes',
    ],
  }),
  router,
);
