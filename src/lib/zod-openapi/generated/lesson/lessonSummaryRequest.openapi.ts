import * as z from 'zod/v4';

export const lessonSummaryRequestOpenAPISchema = z.object({
  lesson: z.string().meta({
    description: 'The slug of the lesson',
    example: 'joining-using-and',
  }),
});
