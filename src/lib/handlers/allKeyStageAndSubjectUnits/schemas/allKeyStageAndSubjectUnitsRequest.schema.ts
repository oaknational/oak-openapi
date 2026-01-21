import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import * as z from 'zod/v4';

export const allKeyStageAndSubjectUnitsRequestSchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string])
    .describe("Key stage slug to filter by, e.g. 'ks2'"),
  subject: z
    .enum(subjectSlugs as [string])
    .describe(
      "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    ),
});
