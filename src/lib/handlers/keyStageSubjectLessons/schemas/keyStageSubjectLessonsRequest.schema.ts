import {
  limitSchema,
  offsetSchema,
  subjectSlugSchema,
  keyStageSlugSchema,
} from '@/lib/handlers/commonTypes';
import * as z from 'zod/v4';

export const keyStageSubjectLessonsRequestSchema = z.object({
  keyStage: keyStageSlugSchema,
  subject: subjectSlugSchema,
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional(),
  offset: offsetSchema,
  limit: limitSchema,
});
