import 'zod-openapi/extend';
import z from 'zod';

export const allKeyStageAndSubjectUnitsResponseOpenAPISchema = z
  .array(
    z.object({
      yearSlug: z
        .string()
        .openapi({ description: 'The year identifier', example: undefined }),
      yearTitle: z
        .string()
        .openapi({ description: 'The year title', example: undefined }),
      units: z
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
          }),
          { description: 'List of units for the specified year' },
        )
        .openapi({ description: 'A list of unit slugs and unit titles' }),
    }),
  )
  .openapi({
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
    ref: 'AllKeyStageAndSubjectUnitsResponseSchema',
  });
