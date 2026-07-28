import 'zod-openapi';
import * as z from 'zod/v4';
const examBoardSchema = z.object({
  title: z.string().describe('The title of the exam board'),
  slug: z.string().describe('The slug of the exam board'),
});
export const allKeyStageAndSubjectUnitsResponseOpenAPISchema = z
  .array(
    z.object({
      yearSlug: z.string().describe('The year identifier').meta({
        example: 'year-3',
      }),
      yearTitle: z.string().describe('The year title').meta({
        example: 'Year 3',
      }),
      units: z
        .array(
          z.object({
            unitSlug: z.string().describe('The unit slug identifier').meta({
              example:
                '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
            }),
            unitTitle: z.string().describe('The unit title').meta({
              example:
                '2, 4 and 8 times tables: using times tables to solve problems',
            }),
            examBoards: z
              .array(examBoardSchema)
              .optional()
              .describe(
                'The exam boards the unit appears in. Only populated for KS4 subjects when the request does not supply an `examBoard` filter.',
              ),
          }),
        )
        .meta({
          description: 'List of units for the specified year',
          example: [
            {
              unitSlug:
                '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
              unitTitle:
                '2, 4 and 8 times tables: using times tables to solve problems',
            },
            {
              unitSlug:
                'bridging-100-counting-on-and-back-in-10s-adding-subtracting-multiples-of-10',
              unitTitle:
                'Bridging 100: counting on and back in 10s, adding/subtracting multiples of 10',
            },
          ],
        }),
    }),
  )
  .meta({
    id: 'AllKeyStageAndSubjectUnitsResponseSchema',
    example: [
      {
        units: [
          {
            unitSlug:
              '2-4-and-8-times-tables-using-times-tables-to-solve-problems',
            unitTitle:
              '2, 4 and 8 times tables: using times tables to solve problems',
          },
          {
            unitSlug:
              'bridging-100-counting-on-and-back-in-10s-adding-subtracting-multiples-of-10',
            unitTitle:
              'Bridging 100: counting on and back in 10s, adding/subtracting multiples of 10',
          },
        ],
        yearSlug: 'year-3',
        yearTitle: 'Year 3',
      },
    ],
  });
