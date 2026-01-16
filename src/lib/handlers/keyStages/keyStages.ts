import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { keyStages } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';
import { keyStageResponseOpenAPISchema } from '@/lib/zod-openapi/generated/keyStages';

export const getKeyStages = router({
  getKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/key-stages',
        summary: 'Key stages',
        errorResponses: [],
        description:
          'This endpoint returns all the key stages (titles and slugs) that are currently available on Oak',
      },
    })
    .input(z.void())
    .output(keyStageResponseOpenAPISchema)
    .query(() => keyStages),
});
