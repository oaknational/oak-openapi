import 'zod-openapi';
import * as z from 'zod/v4';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
export const lessonAssetsRequestOpenAPISchema = z.object({
  lesson: z.string().describe('The lesson slug identifier').meta({
    example: 'creating-a-new-word',
  }),
  type: downloadTypeEnum.optional().meta({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
