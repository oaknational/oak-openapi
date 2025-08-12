import 'zod-openapi/extend';
import { z } from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';

export const lessonAssetsRequestOpenAPISchema = z
  .object({
    lesson: z
      .string({
        description: 'The lesson slug identifier',
      })
      .openapi({ example: 'child-workers-in-the-victorian-era' }),
    type: downloadTypeEnum.optional().openapi({
      description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
    }),
  })
  .openapi({ example: { lesson: 'child-workers-in-the-victorian-era' } });
