import 'zod-openapi/extend';
import z from 'zod';

export const questionsForSequenceRequestOpenAPISchema = z
  .object({
    sequence: z.string().openapi({ example: 'maths-secondary' }),
    year: z.number().optional(),

    offset: z.number().optional().default(0),
    limit: z
      .number({
        description: 'Limit the number of results returned, max 100',
      })
      .lte(100)
      .optional()
      .default(10),
  })
  .openapi({ example: { sequence: 'maths-secondary' } });
