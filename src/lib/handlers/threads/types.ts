import * as z from 'zod/v4';
// import { unitProgrammeFactorsSchema } from '@/lib/handlers/unitProgrammeFactors';

export const threadSchema = z.object({
  title: z.string().meta({ description: 'The thread title' }),
  slug: z.string().meta({ description: 'The thread slug identifier' }),
  unitCount: z
    .number()
    .meta({ description: 'The number of published units in the thread' }),
});

export const unitListSchema = z.array(
  z.object({
    unitTitle: z.string().meta({ description: 'The unit title' }),
    unitSlug: z.string().meta({ description: 'The unit slug identifier' }),
    // programmeFactors: unitProgrammeFactorsSchema
    //   .meta({
    //     description:
    //       'The programme-factor values that identify which variant of this unit the entry represents. Omitted when the unit has no programme factors.',
    //   })
    //   .optional(),
  }),
);
