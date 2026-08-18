import * as z from 'zod/v4';

export const threadUnitsRequestSchema = z.object({
  threadSlug: z
    .string()
    .describe('The thread identifier for a given unit')
    .meta({ example: 'number-multiplication-and-division' }),
});
