import 'zod-openapi/extend';
import z from 'zod';

export const questionsForSequenceRequestOpenAPISchema = z
  .object({
    sequence: z
      .string({
        description:
          'The sequence slug identifier, including the key stage 4 option where relevant.',
      })
      .openapi({ example: 'maths-secondary' }),
    year: z
      .number({
        description:
          'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      })
      .optional()
      .openapi({ example: 8 }),

    offset: z
      .number({
        description:
          'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
      })
      .optional()
      .default(0)
      .openapi({ example: 101 }),
    limit: z
      .number({
        description:
          'Limit the number of lessons, e.g. return a maximum of 100 lessons',
      })
      .lte(100)
      .optional()
      .default(10)
      .openapi({ example: 100 }),
  })
  .openapi({
    example: { sequence: 'maths-secondary', year: 8, limit: 100, offset: 101 },
  });
