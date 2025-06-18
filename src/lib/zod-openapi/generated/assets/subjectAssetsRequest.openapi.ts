import 'zod-openapi/extend';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const subjectAssetsRequestOpenAPISchema = z
  .object({
    keyStage: z.enum(keyStageSlugs as [string], {
      description:
        "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    }),
    subject: z.enum(subjectSlugs as [string], {
      description:
        "Subject slug to search by, e.g. 'science' - note that casing is important here (always lowercase)",
    }),
    type: downloadTypeEnum.optional(),
    unit: z
      .string({
        description: 'Optional unit slug to additionally filter by',
      })
      .optional()
      .openapi({ example: 'word-class' }),
  })
  .openapi({
    example: { keyStage: 'ks1', subject: 'english', unit: 'word-class' },
  });
