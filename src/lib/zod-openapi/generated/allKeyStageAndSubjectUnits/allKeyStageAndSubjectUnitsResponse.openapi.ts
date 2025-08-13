import 'zod-openapi/extend';
import z from 'zod';

export const allKeyStageAndSubjectUnitsResponseOpenAPISchema = z
  .array(
    z.object({
      yearSlug: z.string({ description: 'The year identifier' }),
      yearTitle: z.string({ description: 'The year title' }),
      units: z.array(
        z.object({
          unitSlug: z.string({
            description: 'The unit slug identifier',
          }),
          unitTitle: z.string({ description: 'The unit title' }),
        }),
        { description: 'List of units for the specified year' },
      ),
    }),
  )
  .openapi({
    ref: 'AllKeyStageAndSubjectUnitsResponseSchema',
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
