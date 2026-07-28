import 'zod-openapi';
import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import * as z from 'zod/v4';
export const keyStageSubjectLessonsRequestOpenAPISchema = z.object({
  keyStage: z.enum(keyStageSlugs as [string]).meta({
    description:
      "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
    example: 'ks1',
  }),
  subject: z.enum(subjectSlugs as [string]).meta({
    description:
      "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
    example: 'english',
  }),
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional()
    .meta({
      example: 'word-class',
    }),
  offset: offsetSchema.meta({
    example: 11,
  }),
  limit: limitSchema.meta({
    example: 10,
  }),
});
