import 'zod-openapi/extend';
import z from 'zod';

export const lessonSummaryRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      example: 'joining-using-and',
      description: 'The slug of the lesson',
    }),
});
