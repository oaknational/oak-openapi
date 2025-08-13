import 'zod-openapi/extend';
import { z } from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestOpenAPISchema = z.object({
  lesson: z
    .string()
    .openapi({
      example: 'child-workers-in-the-victorian-era',
      description: 'The lesson slug identifier',
    }),
  type: downloadTypeEnum.optional().openapi({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
