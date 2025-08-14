import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { z } from 'zod';
import 'zod-openapi/extend';

export const lessonAssetRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      description: 'The lesson slug',
      example: 'child-workers-in-the-victorian-era',
    }),
  type: downloadTypeEnum,
});
