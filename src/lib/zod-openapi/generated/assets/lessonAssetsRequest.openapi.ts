import 'zod-openapi/extend';
import { z } from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestOpenAPISchema = z
  .object({
    lesson: z.string({
      description: 'The lesson slug',
    }),
    type: downloadTypeEnum.optional(),
  })
  .openapi({
    example: { lesson: 'child-workers-in-the-victorian-era' },
    ref: 'LessonAssetsRequestSchema',
  });
