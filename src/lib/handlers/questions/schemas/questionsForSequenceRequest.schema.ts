import z from 'zod';

export const questionsForSequenceRequestSchema = z.object({
  sequence: z.string(),
  year: z.number().optional(),

  offset: z.number().optional().default(0),
  limit: z
    .number({
      description: 'Limit the number of results returned, max 100',
    })
    .lte(100)
    .optional()
    .default(10),
});
