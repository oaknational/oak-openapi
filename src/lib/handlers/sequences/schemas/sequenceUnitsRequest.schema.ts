import * as z from 'zod/v4';
import {
  sequenceSlugSchema,
  sequenceYearEnumSchema,
} from '@/lib/handlers/sequences/types';

export const sequenceUnitsRequestSchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearEnumSchema,
});
