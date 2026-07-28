import 'zod-openapi';
import * as z from 'zod/v4';
export const keyStageSubjectLessonsResponseOpenAPISchema = z
  .array(
    z.object({
      unitSlug: z.string().describe('The unit slug identifier').meta({
        example: 'simple-compound-and-adverbial-complex-sentences',
      }),
      unitTitle: z.string().describe('The unit title').meta({
        example: 'Simple, compound and adverbial complex sentences',
      }),
      lessons: z
        .array(
          z.object({
            lessonSlug: z.string().describe('The lesson slug identifier').meta({
              example: 'four-types-of-simple-sentence',
            }),
            lessonTitle: z.string().describe('The lesson title').meta({
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
