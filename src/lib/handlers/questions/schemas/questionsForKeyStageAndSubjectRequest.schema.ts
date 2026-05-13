import { keyStageSlugs, subjectSlugs } from '@/lib/keyStageAndSubjects';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import * as z from 'zod/v4';
import { questionFilterSchema } from '../types';

export const questionsForKeyStageAndSubjectRequestSchema = z.object({
  keyStage: z.enum(keyStageSlugs as [string]).meta({
    description:
      "Key stage slug to filter by, e.g. 'ks2' - note that casing is important here, and should be lowercase",
  }),
  subject: z.enum(subjectSlugs as [string]).meta({
    description:
      "Subject slug to search by, e.g. 'science' - note that casing is important here",
  }),
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
