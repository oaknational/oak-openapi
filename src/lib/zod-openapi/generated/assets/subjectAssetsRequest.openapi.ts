import 'zod-openapi';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import * as z from 'zod/v4';
export const subjectAssetsRequestOpenAPISchema = z.object({
  keyStage: z
    .enum(keyStageSlugs as [string])
    .describe(
      "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    )
    .meta({
      example: 'ks1',
    }),
  subject: z
    .enum(subjectSlugs as [string])
    .describe(
      "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    )
    .meta({
      example: 'english',
    }),
  type: downloadTypeEnum.optional(),
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional()
    .meta({
      example: 'word-class',
    }),
});
