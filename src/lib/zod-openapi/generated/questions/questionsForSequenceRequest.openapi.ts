import 'zod-openapi';
import * as z from 'zod/v4';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';
import { questionFilterSchema } from '../../../handlers/questions/types';
export const questionsForSequenceRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema.meta({
    example: 'maths-secondary',
  }),
  year: sequenceYearSchema.meta({
    example: 8,
  }),
  offset: offsetSchema.meta({
    example: 101,
  }),
  limit: limitSchema.meta({
    example: 100,
  }),
  filter: questionFilterSchema.optional(),
});
