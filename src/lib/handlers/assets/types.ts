import z from 'zod';

export const typeToMime = new Map([
  ['pdf', 'application/pdf'],
  [
    'pptx',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
  ['odp', 'application/vnd.oasis.opendocument.presentation'],
]);

export const downloadTypeEnum = z.enum(
  [
    'slideDeck',
    'exitQuiz',
    'exitQuizAnswers',
    'starterQuiz', // note: graphql key is (currently) starter_quiz
    'starterQuizAnswers',
    'supplementaryResource',
    'video',
    'worksheet',
    'worksheetAnswers',
  ],
  {
    description:
      'Use the this type and the lesson slug in conjunction to get a signed download URL to the asset type from the /api/lessons/{slug}/asset/{type} endpoint',
  },
);

export const assetType = z.object({
  type: downloadTypeEnum,
  label: z.string(),
  url: z.string(),
});

export const lessonAssetsType = z.object({
  attribution: z.array(z.string()).optional(),
  assets: z.array(assetType).optional(),
});

export type LessonAssetsType = z.infer<typeof lessonAssetsType>;

export const lessonsAssetsType = z.array(
  z.object({
    lessonSlug: z.string(),
    lessonTitle: z.string(),
    attribution: z.array(z.string()).optional(),
    assets: z.array(assetType),
  }),
);

export type DownloadTypeEnum = z.infer<typeof downloadTypeEnum>;
