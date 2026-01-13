import { z } from 'zod';
import 'zod-openapi/extend';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestOpenAPISchema = z.object({
  lesson: z.string().openapi({
    description: 'The lesson slug identifier',
    example: 'child-workers-in-the-victorian-era',
  }),
  type: downloadTypeEnum.optional().openapi({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
