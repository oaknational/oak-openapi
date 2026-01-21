import * as z from 'zod/v4';

export const transcriptRequestOpenAPISchema = z.object({
  lesson: z.string().meta({
    description: 'The slug of the lesson',
    example: 'checking-understanding-of-basic-transformations',
  }),
});
