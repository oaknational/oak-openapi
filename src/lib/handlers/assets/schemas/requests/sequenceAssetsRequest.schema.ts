import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import 'zod-openapi/extend';
import {
  sequenceSlugSchema,
  sequenceYearSchema,
} from '@/lib/handlers/sequences/types';

export const sequenceAssetsRequestSchema = z.object({
  sequence: sequenceSlugSchema,
  year: sequenceYearSchema,
  type: downloadTypeEnum.optional().openapi({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
