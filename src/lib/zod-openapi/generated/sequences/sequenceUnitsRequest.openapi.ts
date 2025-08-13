import { z } from 'zod';
import { years } from '@/lib/handlers/sequences/types';
import 'zod-openapi/extend';

export const sequenceUnitsRequestOpenAPISchema = z
  .object({
    sequence: z
      .string({
        description: 'The unique identifier for each sequence',
      })
      .openapi({ example: 'english-primary' }),
    year: z
      .enum(years as [string], {
        description:
          'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
      })
      .openapi({ example: '10' })
      .optional(),
  })
  .openapi({ example: { sequence: 'english-primary', year: '10' } });
