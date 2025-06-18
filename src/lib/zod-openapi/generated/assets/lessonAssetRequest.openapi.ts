import 'zod-openapi/extend';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import { z } from 'zod';

export const lessonAssetRequestOpenAPISchema = z
  .object({
    lesson: z.string({
      description: 'The lesson slug',
    }),
    type: downloadTypeEnum,
  })
  .openapi({
    example: {
      lesson: 'child-workers-in-the-victorian-era',
      type: 'slideDeck',
    },
    ref: 'LessonAssetRequestSchema',
  });
