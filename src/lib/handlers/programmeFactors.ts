import * as z from 'zod/v4';

export const programmeFactorOptionSchema = z.object({
  slug: z.string().describe('The slug identifier for the programme factor'),
  title: z.string().describe('The title of the programme factor'),
});

export const programmeFactorsSchema = z.object({
  examBoard: programmeFactorOptionSchema
    .optional()
    .describe('The exam board that identifies this programme variant'),
  pathway: programmeFactorOptionSchema
    .optional()
    .describe('The pathway that identifies this programme variant'),
  tier: programmeFactorOptionSchema
    .optional()
    .describe('The tier that identifies this programme variant'),
});

export const additionalProgrammeFactorsSchema = z.object({
  examBoards: z
    .array(programmeFactorOptionSchema)
    .optional()
    .describe(
      'The exam boards available for this unit slug when programme variants exist.',
    ),
  pathways: z
    .array(programmeFactorOptionSchema)
    .optional()
    .describe(
      'The pathways available for this unit slug when programme variants exist.',
    ),
  tiers: z
    .array(programmeFactorOptionSchema)
    .optional()
    .describe(
      'The tiers available for this unit slug when programme variants exist.',
    ),
});

export type ProgrammeFactorOption = z.infer<typeof programmeFactorOptionSchema>;
export type ProgrammeFactors = z.infer<typeof programmeFactorsSchema>;
export type AdditionalProgrammeFactors = z.infer<
  typeof additionalProgrammeFactorsSchema
>;
