import {
  getLatestVersion,
  getLatestMajorVersion,
} from '~/lib/handlers/changelog';
import router from '~/lib/router';

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

// to do:
// - make alphabetical

export async function GET() {
  return NextResponse.json(openApiDocument);
}
