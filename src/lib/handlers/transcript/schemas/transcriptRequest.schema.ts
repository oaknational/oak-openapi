import * as z from 'zod/v4';

export const transcriptRequestSchema = z.object({
  lesson: z.string({ description: 'The slug of the lesson' }),
});
