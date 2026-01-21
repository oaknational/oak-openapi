import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import * as z from 'zod/v4';

export const lessonAssetRequestOpenAPISchema = z.object({
  lesson: z.string().meta({
    description: 'The lesson slug',
    example: 'child-workers-in-the-victorian-era',
  }),
  type: downloadTypeEnum,
});
