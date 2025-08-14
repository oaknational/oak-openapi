import { z } from 'zod';
import {
  sequenceSlugSchema,
  sequenceYearEnumSchema,
} from '@/lib/handlers/sequences/types';
import 'zod-openapi/extend';

export const sequenceUnitsRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearEnumSchema,
});
