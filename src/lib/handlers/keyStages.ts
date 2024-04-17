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
        description: 'List all the key stages',
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
        path: '/key-stages/{keyStage}',
        description: 'Get all the subjects for a key stage',
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
      z.array(z.object({ keyStageSlug: z.string(), keyStageTitle: z.string() }))
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
        return { keyStageSlug: slug, keyStageTitle: title };
      });
    }),
});
