import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { z } from 'zod';
import 'zod-openapi/extend';

export const lessonAssetRequestSchema = z.object({
  lesson: z.string({
    description: 'The lesson slug',
  }),
  type: downloadTypeEnum,
});
