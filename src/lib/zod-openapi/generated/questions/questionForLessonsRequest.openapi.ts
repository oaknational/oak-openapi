import 'zod-openapi/extend';
import z from 'zod';

export const questionForLessonsRequestOpenAPISchema = z
  .object({
    lesson: z.string(),
  })
  .openapi({
    example: { lesson: 'joining-using-and' },
    ref: 'QuestionForLessonsRequestSchema',
  });
