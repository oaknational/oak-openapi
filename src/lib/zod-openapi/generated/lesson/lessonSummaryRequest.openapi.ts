import 'zod-openapi/extend';
import z from 'zod';

export const lessonSummaryRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      description: 'The slug of the lesson',
      example: 'joining-using-and',
    }),
});
