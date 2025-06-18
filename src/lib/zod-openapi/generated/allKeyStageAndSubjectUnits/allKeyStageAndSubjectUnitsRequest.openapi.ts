import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';

export const allKeyStageAndSubjectUnitsRequestOpenAPISchema = z
  .object({
    keyStage: z.enum(keyStageSlugs as [string], {
      description: "Key stage slug to filter by, e.g. 'ks2'",
    }),
    subject: z.enum(subjectSlugs as [string], {
      description:
        "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    }),
  })
  .openapi({ example: { keyStage: 'ks1', subject: 'art' } });
