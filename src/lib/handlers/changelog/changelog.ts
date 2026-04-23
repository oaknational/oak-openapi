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
        description: `Use this when you need the full history of significant changes to the API — for example, to surface release notes in a client or to verify which version introduced a field.

Returns every entry in the changelog with its version and date.

Do not use this for:
- Just the latest version (use GET /changelog/latest)`,
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
        description: `Use this when you only need the current API version and its release note — for example, to show a "You're on vX.Y.Z" banner or to check whether a deployment has rolled out.

Returns the most recent changelog entry.

Do not use this for:
- The full version history (use GET /changelog)`,
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
