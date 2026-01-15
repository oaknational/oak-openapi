import * as z from 'zod/v4';

export const allKeyStageAndSubjectUnitsResponseSchema = z.array(
  z.object({
    yearSlug: z.string().describe('The year identifier'),
    yearTitle: z.string().describe('The year title'),
    units: z
      .array(
        z.object({
          unitSlug: z.string().describe('The unit slug identifier'),
          unitTitle: z.string().describe('The unit title'),
        }),
      )
      .meta({ description: 'List of units for the specified year' }),
  }),
);
