import * as z from 'zod/v4';
import {
  limitSchema,
  offsetSchema,
  programmeSlugSchema,
} from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '@/lib/handlers/questions/types';

export const questionsForProgrammeRequestSchema = z.object({
  programme: programmeSlugSchema,
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
