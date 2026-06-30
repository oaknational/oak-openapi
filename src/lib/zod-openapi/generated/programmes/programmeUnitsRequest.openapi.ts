import * as z from 'zod/v4';

export const programmeUnitsRequestOpenAPISchema = z.object({
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'english-secondary-year-10-edexcel',
  }),
});
