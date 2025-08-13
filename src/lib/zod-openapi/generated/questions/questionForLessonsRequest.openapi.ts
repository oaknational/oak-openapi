import 'zod-openapi/extend';
import z from 'zod';

export const questionForLessonsRequestOpenAPISchema = z.object({
  lesson: z.string(),
});
