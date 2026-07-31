import 'zod-openapi';
import { lessonAssetsType } from '@/lib/handlers/assets/types';
export const lessonAssetsResponseOpenAPISchema = lessonAssetsType.meta({
  id: 'LessonAssetsResponseSchema',
  example: {
    oakUrl: 'https://www.thenational.academy/teachers/lessons/using-numerals',
    attribution: [
      'Copyright XYZ Authors',
      'Creative Commons Attribution Example 4.0',
    ],
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
});
