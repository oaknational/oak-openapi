import z from 'zod';

export const transcriptRequestSchema = z.object({
  lesson: z.string({ description: 'The slug of the lesson' }),
});
