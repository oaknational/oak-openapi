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
  label: z.string({ description: 'The label for the asset' }),
  url: z.string({ description: 'The download endpoint for the asset.' }),
});

export const lessonAssetsType = z.object({
  attribution: z.array(z.string()).optional(),
  assets: z.array(assetType).optional(),
});

export type LessonAssetsType = z.infer<typeof lessonAssetsType>;

export const lessonsAssetsType = z.array(
  z.object({
    lessonSlug: z.string({
      description: 'The unique slug identifier for the lesson',
    }),
    lessonTitle: z.string({ description: 'The title for the lesson' }),
    attribution: z
      .array(
        z.string({
          description:
            "Licence information for any third-party content contained in the lessons' downloadable resources",
        }),
      )
      .optional(),
    assets: z.array(assetType, { description: 'List of assets' }),
  }),
);

export type DownloadTypeEnum = z.infer<typeof downloadTypeEnum>;
