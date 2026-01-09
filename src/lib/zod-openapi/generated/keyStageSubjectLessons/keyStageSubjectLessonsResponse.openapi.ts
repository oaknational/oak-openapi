import * as z from 'zod/v4';

export const keyStageSubjectLessonsResponseOpenAPISchema = z
  .array(
    z.object({
      unitSlug: z.string().meta({
        description: 'The unit slug identifier',
        example: 'simple-compound-and-adverbial-complex-sentences',
      }),
      unitTitle: z.string().meta({
        description: 'The unit title',
        example: 'Simple, compound and adverbial complex sentences',
      }),
      lessons: z
        .array(
          z.object({
            lessonSlug: z.string().meta({
              description: 'The lesson slug identifier',
              example: 'four-types-of-simple-sentence',
            }),
            lessonTitle: z.string().meta({
              description: 'The lesson title',
              example: 'Four types of simple sentence',
            }),
          }),
        )
        .meta({
          description: 'List of lessons for the specified unit',
          example: [
            {
              lessonSlug: 'four-types-of-simple-sentence',
              lessonTitle: 'Four types of simple sentence',
            },
            {
              lessonSlug: 'three-ways-for-co-ordination-in-compound-sentences',
              lessonTitle: 'Three ways for co-ordination in compound sentences',
            },
          ],
        }),
    }),
  )
  .meta({
    id: 'KeyStageSubjectLessonsResponseSchema',
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
