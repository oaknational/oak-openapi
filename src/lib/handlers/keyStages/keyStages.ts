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

  // 2025-01-24 disabling this endpoint, not sure it's useful
  // getKeyStageSubjects: protectedProcedure
  //   .meta({
  //     openapi: {
  //       method: 'GET',
  //       tags: ['lists'],
  //       path: '/key-stages/{keyStage}/subjects',
  //       description:
  //         'This endpoint returns all the subjects (titles and slugs) that are currently available on Oak for a given key stage',
  //       example: {
  //         response: [
  //           {
  //             subjectSlug: 'english',
  //             subjectTitle: 'English',
  //           },
  //           {
  //             subjectSlug: 'geography',
  //             subjectTitle: 'Geography',
  //           },
  //         ],
  //       },
  //     },
  //   })
  //   .input(
  //     z.object({
  //       keyStage: z.enum(keyStageSlugs as [string], {
  //         description:
  //           "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
  //       }),
  //     }),
  //   )
  //   .output(
  //     z.array(z.object({ subjectSlug: z.string(), subjectTitle: z.string() })),
  //   )
  //   .query(() => {
  //     // const key = decodeURIComponent(input.keyStage);
  //     const res = subjectsByKeyStage();
  //     if (!res) {
  //       throw new TRPCError({
  //         message: 'Invalid key stage',
  //         code: 'BAD_REQUEST',
  //       });
  //     }

  //     return res.map(({ slug, title }) => {
  //       return { subjectSlug: slug, subjectTitle: title };
  //     });
  //   }),
});
