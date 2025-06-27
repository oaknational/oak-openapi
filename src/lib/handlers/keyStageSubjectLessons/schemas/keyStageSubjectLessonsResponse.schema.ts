import z from 'zod';

export const keyStageSubjectLessonsResponseSchema = z.array(
  z.object({
    unitSlug: z.string({ description: 'Unit slug' }),
    unitTitle: z.string({ description: 'Unit title' }),
    lessons: z.array(
      z.object({
        lessonSlug: z.string({ description: 'Lesson slug' }),
        lessonTitle: z.string({ description: 'Lesson title' }),
      }),
    ),
  }),
);
