import z from 'zod';
import { assetType } from '@/lib/handlers/assets/types';

export const sequenceAssetsResponseSchema = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    attribution: z.array(z.string()).optional(),
    assets: z.array(assetType),
  }),
);
