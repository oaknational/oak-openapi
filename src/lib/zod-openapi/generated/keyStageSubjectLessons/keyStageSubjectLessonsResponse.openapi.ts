import 'zod-openapi/extend';
import z from 'zod';

export const keyStageSubjectLessonsResponseOpenAPISchema = z
  .array(
    z.object({
      unitSlug: z
        .string()
        .openapi({
          description: 'The unit slug identifier',
          example: undefined,
        }),
      unitTitle: z
        .string()
        .openapi({ description: 'The unit title', example: undefined }),
      lessons: z
        .array(
          z.object({
            lessonSlug: z
              .string()
              .openapi({
                description: 'The lesson slug identifier',
                example: undefined,
              }),
            lessonTitle: z
              .string()
              .openapi({ description: 'The lesson title', example: undefined }),
          }),
        )
        .openapi({
          description: 'List of lessons for the specified unit',
          example: undefined,
        }),
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
