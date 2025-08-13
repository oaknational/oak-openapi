import { z } from 'zod';
import { years } from '@/lib/handlers/sequences/types';
import 'zod-openapi/extend';

export const sequenceUnitsRequestSchema = z.object({
  sequence: z.string().openapi({
    description:
      'The sequence slug identifier, including the key stage 4 option where relevant.',
  }),
  year: z
    .enum(years as [string])
    .openapi({
      description:
        'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
    })
    .optional(),
});
