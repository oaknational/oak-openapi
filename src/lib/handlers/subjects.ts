import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import { subjectsWithKeyStages } from '../keyStageAndSubjects';

export const subjectsRouter = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        description:
          'This endpoint returns an array of all subjects that are currently available on Oak across all key stages',
        example: {
          response: [
            {
              subjectTitle: 'English',
              subjectSlug: 'english',
              keyStages: ['ks1', 'ks2', 'ks3', 'ks4'],
            },
            {
              subjectTitle: 'Geography',
              subjectSlug: 'geography',
              keyStages: ['ks1', 'ks2'],
            },
          ],
        },
      },
    })
    .input(z.void()) // required by trpc-openapi
    .output(z.any())
    .query(() => {
      return subjectsWithKeyStages();
    }),
});
