import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  keyStages,
  keyStageSlugs,
  subjectsByKeyStage,
} from '~/lib/keyStageAndSubjects';
import { z } from 'zod';

export const getKeyStages = router({
  getKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/key-stages',
        description:
          'This endpoint returns all the key stages (titles and slugs) that are currently available on Oak',
        example: { response: [{ slug: 'ks1', title: 'Key Stage 1' }] },
      },
    })
    .input(z.void())
    .output(
      z.array(
        z.object({
          slug: z.string(),
          title: z.string(),
        })
      )
    )
    .query(() => keyStages),
  getKeyStageSubjects: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lists'],
        path: '/key-stages/{keyStage}/subjects',
        description:
          'This endpoint returns all the subjects (titles and slugs) that are currently available on Oak for a given key stage',
        example: {
          response: [
            {
              subjectSlug: 'english',
              subjectTitle: 'English',
            },
            {
              subjectSlug: 'geography',
              subjectTitle: 'Geography',
            },
          ],
        },
      },
    })
    .input(
      z.object({
        keyStage: z.enum(keyStageSlugs as [string], {
          description:
            "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
        }),
      })
    )
    .output(
      z.array(z.object({ subjectSlug: z.string(), subjectTitle: z.string() }))
    )
    .query(({ input }) => {
      const key = decodeURIComponent(input.keyStage);
      const res = subjectsByKeyStage(key);
      if (!res) {
        throw new TRPCError({
          message: 'Invalid key stage',
          code: 'BAD_REQUEST',
        });
      }

      return res.map(({ slug, title }) => {
        return { subjectSlug: slug, subjectTitle: title };
      });
    }),
});
