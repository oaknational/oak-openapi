import { z } from 'zod';

export const numberArrayResult = z.array(z.number()).openapi({
  description: 'The years for which this subject has content available for',
});

export const keyStagesResult = z
  .array(
    z.object({
      keyStageTitle: z
        .string()
        .openapi({
          description: 'The key stage title for the given key stage',
        }),
      keyStageSlug: z
        .string()
        .openapi({
          description: 'The unique identifier for a given key stage',
        }),
    }),
  )
  .openapi({
    description:
      'The key stage slug identifiers for which this subject has content available for.',
  });

export const sequenceResult = z.object({
  sequenceSlug: z.string().openapi({
    description: 'The unique identifier for each sequence',
  }),
  years: numberArrayResult,
  keyStages: keyStagesResult,
  phaseSlug: z.string().openapi({
    description:
      'The unique identifier for the phase to which this sequence belongs',
  }),
  phaseTitle: z.string().openapi({
    description: 'The title for the phase to which this sequence belongs',
  }),
  ks4Options: z
    .object({
      title: z.string(),
      slug: z.string(),
    })
    .openapi({
      description:
        'The key stage 4 study pathway that this sequence represents. May be null.',
    })
    .nullable(),
});

export type SequenceResult = z.infer<typeof sequenceResult>;

export const subjectResult = z.object({
  subjectTitle: z.string().openapi({ description: 'The subject title' }),
  subjectSlug: z
    .string()
    .openapi({ description: 'The subject slug identifier' }),
  sequenceSlugs: z.array(sequenceResult).openapi({
    description:
      'Information about the years, key stages and key stage 4 variance for each sequence',
  }),
  years: numberArrayResult,
  keyStages: keyStagesResult,
});
