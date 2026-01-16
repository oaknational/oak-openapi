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
    .meta({
      description: 'Optional unit slug to additionally filter by',
      example: 'word-class',
    })
    .optional(),
  offset: offsetSchema.describe(
    'Limit the number of lessons returned per unit. Units with zero lessons after limiting are omitted.',
  ),
  limit: limitSchema.describe(
    'Offset applied to lessons within each unit (not to the unit list).',
  ),
});
