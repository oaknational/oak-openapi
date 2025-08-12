import z from 'zod';

export const allKeyStageAndSubjectUnitsResponseSchema = z.array(
  z.object({
    yearSlug: z.string({ description: 'The year identifier' }),
    yearTitle: z.string({ description: 'The year title' }),
    units: z.array(
      z.object({
        unitSlug: z.string({
          description: 'The unit slug identifier',
        }),
        unitTitle: z.string({ description: 'The unit title' }),
      }),
      { description: 'List of units for the specified year' },
    ),
  }),
);
