import 'zod-openapi/extend';
import { z } from 'zod';
import { years } from '@/lib/handlers/sequences/types';

export const sequenceUnitsRequestOpenAPISchema = z
  .object({
    sequence: z.string(),
    year: z.enum(years as [string]).optional(),
  })
  .openapi({
    example: { sequence: 'english-primary' },
    ref: 'SequenceUnitsRequestSchema',
  });
