import { z } from 'zod';
import { years } from '../sequences';

export const sequenceUnitsRequestSchema = z.object({
  sequence: z.string(),

  year: z.enum(years as [string]).optional(),
});
