import 'zod-openapi/extend';
import z from 'zod';

export const lessonSummaryRequestOpenAPISchema = z
  .object({
    lesson: z.string({ description: 'The slug of the lesson' }),
  })
  .openapi({
    example: { lesson: 'joining-using-and' },
    ref: 'LessonSummaryRequestSchema',
  });
