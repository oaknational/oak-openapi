import 'zod-openapi/extend';
import z from 'zod';

export const keyStageSubjectLessonsResponseOpenAPISchema = z
  .array(
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
  )
  .openapi({
    ref: 'KeyStageSubjectLessonsResponseSchema',
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
  });
