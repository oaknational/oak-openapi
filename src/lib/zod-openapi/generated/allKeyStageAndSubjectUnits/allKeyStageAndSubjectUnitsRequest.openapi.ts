import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';

export const allKeyStageAndSubjectUnitsRequestOpenAPISchema = z.object({
  keyStage: z.enum(keyStageSlugs as [string]).openapi({
    description: "Key stage slug to filter by, e.g. 'ks2'",
    example: 'ks1',
  }),
  subject: z.enum(subjectSlugs as [string]).openapi({
    description:
      "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    example: 'art',
  }),
});
