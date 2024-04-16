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
      },
    })
    .input(z.void()) // required by trpc-openapi
    .output(z.any())
    .query(() => {
      return subjects.toSorted();
    }),
  searchSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['search'],
        method: 'GET',
        path: '/search/subjects',
        description: 'Search for specific subject',
      },
    })
    .input(z.object({ q: z.string() }))
    .output(z.string().array())
    .query(({ input }) => {
      const q = input.q.toLowerCase();
      const res = subjects.filter((_) => _.toLowerCase().includes(q));
      return res;
    }),
});
