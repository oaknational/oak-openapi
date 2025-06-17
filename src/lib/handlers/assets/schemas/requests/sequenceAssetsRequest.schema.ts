import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const sequenceAssetsRequestSchema = z.object({
  sequence: z.string(),
  year: z.number().optional(),
  type: downloadTypeEnum.optional(),
});
