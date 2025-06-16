import { z } from 'zod';
import { years } from '@/lib/handlers/sequences/types';

export const sequenceUnitsRequestSchema = z.object({
  sequence: z.string(),
  year: z.enum(years as [string]).optional(),
});
