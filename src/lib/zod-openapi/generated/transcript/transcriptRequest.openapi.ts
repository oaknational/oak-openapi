import 'zod-openapi/extend';
import z from 'zod';

export const transcriptRequestOpenAPISchema = z.object({
  lesson: z.string().openapi({
    description: 'The slug of the lesson',
    example: 'checking-understanding-of-basic-transformations',
  }),
});
