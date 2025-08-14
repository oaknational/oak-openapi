import z from 'zod';

export const keyStageSubjectLessonsResponseSchema = z.array(
  z.object({
    unitSlug: z.string({ description: 'The unit slug identifier' }),
    unitTitle: z.string({ description: 'The unit title' }),
    lessons: z.array(
      z.object({
        lessonSlug: z.string({ description: 'The lesson slug identifier' }),
        lessonTitle: z.string({ description: 'The lesson title' }),
      }),
      { description: 'List of lessons for the specified unit' },
    ),
  }),
);
