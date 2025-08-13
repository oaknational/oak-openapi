import 'zod-openapi/extend';
import z from 'zod';

export const transcriptRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      example: 'checking-understanding-of-basic-transformations',
      description: 'The slug of the lesson',
    }),
});
