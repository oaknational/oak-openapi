import * as z from 'zod/v4';
import {
  limitSchema,
  offsetSchema,
  keyStageSlugSchema,
  subjectSlugSchema,
} from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '../types';

export const questionsForKeyStageAndSubjectRequestSchema = z.object({
  keyStage: keyStageSlugSchema,
  subject: subjectSlugSchema,
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
