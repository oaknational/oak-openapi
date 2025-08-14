import { z } from 'zod';
import 'zod-openapi/extend';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestSchema = z.object({
  lesson: z.string({
    description: 'The lesson slug identifier',
  }),
  type: downloadTypeEnum.optional().openapi({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
