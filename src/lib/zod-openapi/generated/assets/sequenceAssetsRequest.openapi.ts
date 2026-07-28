import 'zod-openapi';
import * as z from 'zod/v4';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';
export const sequenceAssetsRequestOpenAPISchema = z.object({
  sequence: sequenceSlugSchema.meta({
    example: 'maths-primary',
  }),
  year: sequenceYearSchema.meta({
    example: 3,
  }),
  type: downloadTypeEnum.optional().meta({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
    example: 'video',
  }),
});
