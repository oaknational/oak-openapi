import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import * as z from 'zod/v4';
import {
  limitSchema,
  offsetSchema,
  keyStageSlugSchema,
  subjectSlugSchema,
} from '@/lib/handlers/commonTypes';

export const subjectAssetsRequestSchema = z.object({
  keyStage: keyStageSlugSchema,
  subject: subjectSlugSchema,
  type: downloadTypeEnum.optional(),
  unit: z
    .string()
    .describe('Optional unit slug to additionally filter by')
    .optional(),
  offset: offsetSchema,
  limit: limitSchema,
});
