import 'zod-openapi/extend';
import z from 'zod';

export const keyStageSubjectLessonsResponseOpenAPISchema = z
  .array(
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
  )
  .openapi({
    example: [
      {
        unitSlug: 'simple-compound-and-adverbial-complex-sentences',
        unitTitle: 'Simple, compound and adverbial complex sentences',
        lessons: [
          {
            lessonSlug: 'four-types-of-simple-sentence',
            lessonTitle: 'Four types of simple sentence',
          },
          {
            lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
            lessonTitle: 'Three ways for co-ordination in compound sentences',
          },
        ],
      },
    ],
    ref: 'KeyStageSubjectLessonsResponseSchema',
  });
