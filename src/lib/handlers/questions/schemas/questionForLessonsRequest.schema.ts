import * as z from 'zod/v4';

export const questionForLessonsRequestSchema = z.object({
  lesson: z.string().describe('The lesson slug identifier'),
});
