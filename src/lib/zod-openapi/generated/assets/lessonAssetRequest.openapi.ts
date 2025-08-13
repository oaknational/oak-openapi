import 'zod-openapi/extend';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { z } from 'zod';

export const lessonAssetRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      example: 'child-workers-in-the-victorian-era',
      description: 'The lesson slug',
    }),
  type: downloadTypeEnum,
});
