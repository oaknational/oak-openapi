import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import { subjects } from '../keyStageAndSubjects';

export const subjectsRouter = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        description: 'List all the subjects across all key stages',
        example: { response: ['Biology', 'Chemistry', '...'] },
      },
    })
    .input(z.void()) // required by trpc-openapi
    .output(z.any())
    .query(() => {
      return subjects.toSorted();
    }),
});
