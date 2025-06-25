import { z } from 'zod';

export const numberArrayResult = z.array(z.number());

export const keyStagesResult = z.array(
  z.object({ keyStageTitle: z.string(), keyStageSlug: z.string() }),
);

export const sequenceResult = z.object({
  sequenceSlug: z.string(),
  years: numberArrayResult,
  keyStages: keyStagesResult,
  phaseSlug: z.string(),
  phaseTitle: z.string(),
  ks4Options: z
    .object({
      title: z.string(),
      slug: z.string(),
    })
    .nullable(),
});

export type SequenceResult = z.infer<typeof sequenceResult>;

export const subjectResult = z.object({
  subjectTitle: z.string(),
  subjectSlug: z.string(),
  sequenceSlugs: z.array(sequenceResult),
  years: numberArrayResult,
  keyStages: keyStagesResult,
});
