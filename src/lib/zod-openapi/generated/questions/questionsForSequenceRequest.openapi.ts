import 'zod-openapi/extend';
import z from 'zod';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';
import { limitSchema, offsetSchema } from '@/lib/handlers/commonTypes';

export const questionsForSequenceRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearSchema,
  offset: offsetSchema,
  limit: limitSchema,
});
