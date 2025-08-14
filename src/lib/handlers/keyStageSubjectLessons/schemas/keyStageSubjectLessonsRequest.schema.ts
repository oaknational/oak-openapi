import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import z from 'zod';

export const keyStageSubjectLessonsRequestSchema = z.object({
  keyStage: z.enum(keyStageSlugs as [string], {
    description:
      "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
  }),
  subject: z.enum(subjectSlugs as [string], {
    description:
      "Subject slug to filter by, e.g. 'english' - note that casing is important here, and should be lowercase",
  }),
  unit: z
    .string({
      description: 'Optional unit slug to additionally filter by',
    })
    .optional(),
  offset: offsetSchema,
  limit: limitSchema,
});
