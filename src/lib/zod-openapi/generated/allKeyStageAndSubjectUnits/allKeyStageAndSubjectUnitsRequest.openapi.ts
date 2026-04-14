import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { examBoards } from '@/lib/oakConsts';
import * as z from 'zod/v4';

export const allKeyStageAndSubjectUnitsRequestOpenAPISchema = z.object({
  keyStage: z.enum(keyStageSlugs as [string]).meta({
    description: "Key stage slug to filter by, e.g. 'ks2'",
    example: 'ks1',
  }),
  subject: z.enum(subjectSlugs as [string]).meta({
    description:
      "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    example: 'art',
  }),
  examBoard: z
    .enum(examBoards as [string])
    .optional()
    .meta({
      description:
        "Optional exam board slug to filter units by, e.g. 'aqa'. Only meaningful at KS4 where subjects are broken down by exam board.",
      example: 'aqa',
    }),
});
