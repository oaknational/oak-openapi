import * as z from 'zod/v4';

export const questionForLessonsRequestSchema = z.object({
  lesson: z.string({ description: 'The lesson slug identifier' }),
});
