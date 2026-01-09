import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import * as z from 'zod/v4';

export const lessonAssetRequestSchema = z.object({
  lesson: z.string({
    description: 'The lesson slug',
  }),
  type: downloadTypeEnum,
});
