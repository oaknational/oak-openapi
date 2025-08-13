import z from 'zod';
import { downloadTypeEnum } from '@/lib/handlers/assets/types';
import 'zod-openapi/extend';

export const sequenceAssetsRequestOpenAPISchema = z.object({
  sequence: z.string().openapi({
    description:
      'The sequence slug identifier, including the key stage 4 option where relevant.',
  }),
  year: z.number().optional().openapi({
    description:
      'The year group to filter by. For the physical-education-primary sequence, a value of all-years can also be used.',
  }),
  type: downloadTypeEnum.optional().openapi({
    description: `Optional asset type specifier

Available values: slideDeck, exitQuiz, exitQuizAnswers, starterQuiz, starterQuizAnswers, supplementaryResource, video, worksheet, worksheetAnswers`,
  }),
});
