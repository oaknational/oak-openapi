import 'zod-openapi/extend';
import z from 'zod';
import { assetType } from '@/lib/handlers/assets/types';

export const sequenceAssetsResponseOpenAPISchema = z
  .array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      attribution: z.array(z.string()).optional(),
      assets: z.array(assetType),
    }),
  )
  .openapi({
    example: [
      {
        lessonSlug: 'using-numerals',
        lessonTitle: 'Using numerals',
        assets: [
          {
            label: 'Worksheet',
            type: 'worksheet',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheet',
          },
          {
            label: 'Worksheet Answers',
            type: 'worksheetAnswers',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/worksheetAnswers',
          },
          {
            label: 'Video',
            type: 'video',
            url: 'https://open-api.thenational.academy/api/v0/lessons/using-numerals/assets/video',
          },
        ],
      },
    ],
  });
