import * as z from 'zod/v4';

export const questionForLessonsRequestOpenAPISchema = z.object({
  lesson: z.string().meta({
    description: 'The lesson slug identifier',
    example: 'imagining-you-are-the-characters-the-three-billy-goats-gruff',
  }),
});
