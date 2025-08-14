import z from 'zod';

export const questionForLessonsRequestSchema = z.object({
  lesson: z.string({ description: 'The lesson slug identifier' }),
});
