import 'zod-openapi';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import * as z from 'zod/v4';
export const lessonAssetRequestOpenAPISchema = z.object({
  lesson: z.string().describe('The lesson slug').meta({
    example: 'child-workers-in-the-victorian-era',
  }),
  type: downloadTypeEnum.meta({
    example: 'slideDeck',
  }),
});
