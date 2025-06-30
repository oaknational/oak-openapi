import z from 'zod';

export const allKeyStageAndSubjectUnitsResponseSchema = z.array(
  z.object({
    yearSlug: z.string({ description: 'Year group slug' }),
    yearTitle: z.string({ description: 'Year group title' }),
    units: z.array(
      z.object({
        unitSlug: z.string({ description: 'Unit slug' }),
        unitTitle: z.string({ description: 'Unit title' }),
      }),
    ),
  }),
);
