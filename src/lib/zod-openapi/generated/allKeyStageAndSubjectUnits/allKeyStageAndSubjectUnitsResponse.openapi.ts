import * as z from 'zod/v4';

const examBoardSchema = z.object({
  title: z.string().meta({ description: 'The title of the exam board' }),
  slug: z.string().meta({ description: 'The slug of the exam board' }),
});

export const allKeyStageAndSubjectUnitsResponseOpenAPISchema = z
  .array(
    z.object({
      yearSlug: z
        .string()
        .meta({ description: 'The year identifier', example: 'year-3' }),
      yearTitle: z
        .string()
        .meta({ description: 'The year title', example: 'Year 3' }),
      units: z
        .array(
          z.object({
            unitSlug: z.string().describe('The unit slug identifier'),
            unitTitle: z.string().describe('The unit title'),
            examBoards: z.array(examBoardSchema).optional().meta({
              description:
                'The exam boards the unit appears in. Only populated for KS4 subjects when the request does not supply an `examBoard` filter.',
            }),
          }),
        )
        .meta({ description: 'List of units for the specified year' }),
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
