import { z } from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestSchema = z.object({
  lesson: z.string({
    description: 'The lesson slug',
  }),
  type: downloadTypeEnum.optional(),
});
