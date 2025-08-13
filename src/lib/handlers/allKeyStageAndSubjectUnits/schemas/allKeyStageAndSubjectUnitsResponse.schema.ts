import z from 'zod';
import 'zod-openapi/extend';

export const allKeyStageAndSubjectUnitsResponseSchema = z.array(
  z.object({
    yearSlug: z.string({ description: 'The year identifier' }),
    yearTitle: z.string({ description: 'The year title' }),
    units: z
      .array(
        z.object({
          unitSlug: z.string({
            description: 'The unit slug identifier',
          }),
          unitTitle: z.string({ description: 'The unit title' }),
        }),
      )
      .openapi({ description: 'List of units for the specified year' }),
  }),
);
