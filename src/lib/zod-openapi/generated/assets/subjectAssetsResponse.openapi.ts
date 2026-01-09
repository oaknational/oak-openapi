import { lessonsAssetsType } from '@/lib/handlers/assets/types';

export const subjectAssetsResponseOpenAPISchema = lessonsAssetsType.meta({
  id: 'SubjectAssetsResponseSchema',
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
