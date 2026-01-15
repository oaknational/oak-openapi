import * as z from 'zod/v4';

import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestSchema = z.object({
  lesson: z.string().describe('The lesson slug identifier'),
  type: downloadTypeEnum.optional().meta({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
