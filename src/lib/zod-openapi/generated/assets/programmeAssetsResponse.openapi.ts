import { lessonsAssetsType } from '@/lib/handlers/assets/types';

export const programmeAssetsResponseOpenAPISchema = lessonsAssetsType.meta({
  id: 'ProgrammeAssetsResponseSchema',
  example: [
    {
      lessonSlug: 'variables-and-data-types',
      lessonTitle: 'Variables and data types',
      assets: [
        {
          label: 'Worksheet',
          type: 'worksheet',
          url: 'https://open-api.thenational.academy/api/v0/lessons/variables-and-data-types/assets/worksheet',
        },
        {
          label: 'Slide Deck',
          type: 'slideDeck',
          url: 'https://open-api.thenational.academy/api/v0/lessons/variables-and-data-types/assets/slideDeck',
        },
      ],
    },
  ],
});
