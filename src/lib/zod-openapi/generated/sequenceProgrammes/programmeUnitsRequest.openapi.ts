import * as z from 'zod/v4';

export const programmeUnitsRequestOpenAPISchema = z.object({
  sequence: z.string().meta({
    description: 'The sequence slug identifier',
    example: 'english-secondary',
  }),
  programme: z.string().meta({
    description: 'The programme slug identifier',
    example: 'english-secondary-year-10-edexcel',
  }),
});
