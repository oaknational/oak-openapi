import { publicProcedure, router } from '@/lib/trpc';
import * as z from 'zod/v4';
import { changelogResponseSchema } from './schemas/changelogResponse.schema';
import { changelogLatestSchema } from './schemas/changelogLatestResponse.schema';
import { versions } from './helpers';
import { errorResponses } from '@/lib/errorResponses';

export const changelog = router({
  changelog: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/changelog',
        tags: ['internal'],
        errorResponses,
        summary: 'API changelog',
        description: `Use when you need the full history of API changes — for surfacing release notes or checking which version introduced a field. Returns every changelog entry with version and date.

Not for: the current version (GET /changelog/latest).`,
      },
    })
    .output(
      changelogResponseSchema.meta({
        example: versions.slice(0, 2),
      }),
    )
    .input(z.undefined())
    .query(() => {
      return versions;
    }),
  latest: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/changelog/latest',
        errorResponses,
        summary: 'Latest API version',
        description: `Use when you only need the current API version — e.g. a version banner or deployment check. Returns the most recent changelog entry.

Not for: full version history (GET /changelog).`,
        tags: ['internal'],
      },
    })
    .output(
      changelogLatestSchema.meta({
        example: {
          ...versions[0],
        },
      }),
    )
    .input(z.undefined())
    .query(() => {
      return versions[0];
    }),
});
