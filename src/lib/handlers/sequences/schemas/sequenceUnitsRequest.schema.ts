import { z } from 'zod';
import { years } from '@/lib/handlers/sequences/types';

export const sequenceUnitsRequestSchema = z.object({
  sequence: z.string().openapi({
    example: 'maths-secondary',
    description: 'The unique identifier for each sequence',
  }),
  year: z
    .enum(years as [string])
    .openapi({
      description:
        'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      example: '3',
    })
    .optional(),
});
