import 'zod-openapi/extend';
import z from 'zod';

export const questionForLessonsRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      description: 'The lesson slug identifier',
      example: 'imagining-you-are-the-characters-the-three-billy-goats-gruff',
    }),
});
