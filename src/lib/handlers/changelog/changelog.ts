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
        description:
          'History of significant changes to the API with associated dates and versions',
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
        description:
          'Get the latest version and latest change note for the API',
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
