import { z } from 'zod';
import { sequenceSlugSchema, years } from '@/lib/handlers/sequences/types';
import 'zod-openapi/extend';

export const sequenceUnitsRequestSchema = z.object({
  sequence: sequenceSlugSchema,
  year: z
    .enum(years as [string], {
      description:
        'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    })
    .optional(),
});
