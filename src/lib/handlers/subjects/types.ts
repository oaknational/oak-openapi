import { z } from 'zod';

export const numberArrayResult = z.array(z.number(), {
  description: 'The years for which this subject has content available for',
});

export const keyStagesResult = z.array(
  z.object(
    { keyStageTitle: z.string(), keyStageSlug: z.string() },
    {
      description:
        'The key stage slug identifiers for which this subject has content available for.',
    },
  ),
);

export const sequenceResult = z.object({
  sequenceSlug: z.string({
    description: 'The unique identifier for each sequence',
  }),
  years: numberArrayResult,
  keyStages: keyStagesResult,
  phaseSlug: z.string({
    description:
      'The unique identifier for the phase to which this sequence belongs',
  }),
  phaseTitle: z.string({
    description: 'The title for the phase to which this sequence belongs',
  }),
  ks4Options: z
    .object(
      {
        title: z.string(),
        slug: z.string(),
      },
      {
        description:
          'The key stage 4 study pathway that this sequence represents. May be null.',
      },
    )
    .nullable(),
});

export type SequenceResult = z.infer<typeof sequenceResult>;

export const subjectResult = z.object({
  subjectTitle: z.string({ description: 'The subject title' }),
  subjectSlug: z.string({ description: 'The subject slug identifier' }),
  sequenceSlugs: z.array(sequenceResult, {
    description:
      'Information about the years, key stages and key stage 4 variance for each sequence',
  }),
  years: numberArrayResult,
  keyStages: keyStagesResult,
});
