import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { lessonSlugSchema } from '@/lib/handlers/commonTypes';

import * as z from 'zod/v4';

export const lessonAssetRequestSchema = z.object({
  lesson: lessonSlugSchema,
  type: downloadTypeEnum,
});
