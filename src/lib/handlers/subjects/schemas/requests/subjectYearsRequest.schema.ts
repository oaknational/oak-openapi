import z from 'zod';
import 'zod-openapi/extend';

export const subjectYearsRequestSchema = z.object({
  subject: z.string().openapi({
    example: 'cooking-nutrition',
    description: 'Subject slug to filter by',
  }),
});
