import * as z from 'zod/v4';

export const subjectYearsRequestOpenAPISchema = z.object({
  subject: z.string().meta({
    example: 'cooking-nutrition',
    description: 'Subject slug to filter by',
  }),
});
