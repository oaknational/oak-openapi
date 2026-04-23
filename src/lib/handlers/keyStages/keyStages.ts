import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { keyStages } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';
import { keyStageResponseOpenAPISchema } from '@/lib/zod-openapi/generated/keyStages';
import { errorResponses } from '@/lib/errorResponses';

export const getKeyStages = router({
  getKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/key-stages',
        summary: 'All key stages',
        errorResponses,
        description: `Use this when you need the master list of key stages currently available on Oak — typically to populate a key-stage picker or validate a slug.

Returns every key stage with its title and slug.

Do not use this for:
- Key stages restricted to a specific subject (use GET /subjects/{subject}/key-stages)`,
      },
    })
    .input(z.void())
    .output(keyStageResponseOpenAPISchema)
    .query(() => keyStages),
});
