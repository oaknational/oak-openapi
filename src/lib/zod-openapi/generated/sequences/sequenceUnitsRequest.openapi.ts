import { z } from 'zod';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';
import 'zod-openapi/extend';

export const sequenceUnitsRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearSchema.optional(),
});
