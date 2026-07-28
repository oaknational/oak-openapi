import 'zod-openapi';
import * as z from 'zod/v4';
import {
  sequenceSlugSchema,
  sequenceYearEnumSchema,
} from '@/lib/handlers/sequences/types';
export const sequenceUnitsRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema.meta({
    example: 'english-primary',
  }),
  year: sequenceYearEnumSchema.meta({
    example: '1',
  }),
});
