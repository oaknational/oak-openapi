import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const subjectAssetsRequestOpenAPISchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string])
    .openapi({
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
      example: 'ks1',
    }),
  subject: z
    .enum(subjectSlugs as [string])
    .openapi({
      description:
        "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
      example: 'english',
    }),
  type: downloadTypeEnum.optional(),
  unit: z
    .string()
    .openapi({
      description: 'Optional unit slug to additionally filter by',
      example: 'word-class',
    })
    .optional(),
});
