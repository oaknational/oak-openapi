import 'zod-openapi/extend';
import z from 'zod';

export const questionsForSequenceRequestOpenAPISchema = z
  .object({
    sequence: z
      .string({ description: 'The unique identifier for each sequence' })
      .openapi({
        example: 'maths-secondary',
      }),
    year: z
      .number({
        description:
          'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      })
      .optional()
      .openapi({
        example: 8,
      }),
    offset: z
      .number({
        description:
          'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
      })
      .optional()
      .default(0)
      .openapi({
        example: 101,
      }),
    limit: z
      .number({
        description: 'Limit the number of results returned, max 100',
      })
      .lte(100)
      .optional()
      .default(10)
      .openapi({
        example: 100,
      }),
  })
  // note: not convinced this is being used… (test by changing the value)
  .openapi({ example: { sequence: 'maths-secondary' } });
