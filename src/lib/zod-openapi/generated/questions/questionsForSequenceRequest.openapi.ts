import 'zod-openapi/extend';
import z from 'zod';

export const questionsForSequenceRequestOpenAPISchema = z.object({
  sequence: z
    .string()
    .openapi({
      description:
        'The sequence slug identifier, including the key stage 4 option where relevant.',
      example: 'maths-secondary',
    }),
  year: z
    .number({
      description:
        'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    })
    .optional(),

  offset: z
    .number({
      description:
        'If limiting results returned, this allows you to return the next set of results, starting at the given offset point',
    })
    .optional()
    .default(0),
  limit: z
    .number({
      description:
        'Limit the number of lessons, e.g. return a maximum of 100 lessons',
    })
    .lte(100)
    .optional()
    .default(10),
});
