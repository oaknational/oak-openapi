import * as z from 'zod/v4';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '@/lib/handlers/questions/types';

export const questionsForSequenceRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearSchema,
  offset: offsetSchema,
  limit: limitSchema,
  filter: questionFilterSchema.optional(),
});
