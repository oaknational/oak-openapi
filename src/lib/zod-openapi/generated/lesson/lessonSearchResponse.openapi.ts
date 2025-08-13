import z from 'zod';
import 'zod-openapi/extend';

export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string({ description: 'The lesson slug identifier' }),
  lessonTitle: z.string({ description: 'The lesson title' }),
  similarity: z.number({
    description: 'The snippet of the transcript that matched the search term',
  }),
  units: z.array(
    z.object({
      unitSlug: z.string(),
      unitTitle: z.string(),
      examBoardTitle: z.string().or(z.null()),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    }),
    { description: 'The units that the lesson is part of' },
  ),
});

export const lessonSearchResponseOpenAPISchema = z
  .array(lessonSearchResultSchema)
  .openapi({
    ref: 'LessonSearchResponseSchema',
    example: [
      {
        lessonSlug: 'performing-your-chosen-gothic-poem',
        lessonTitle: 'Performing your chosen Gothic poem',
        similarity: 0.20588236,
        units: [
          {
            unitSlug: 'gothic-poetry',
            unitTitle: 'Gothic poetry',
            examBoardTitle: null,
            keyStageSlug: 'ks3',
            subjectSlug: 'english',
          },
        ],
      },
      {
        lessonSlug: 'the-twisted-tree-the-novel-as-a-gothic-text',
        lessonTitle: "'The Twisted Tree': the novel as a Gothic text",
        similarity: 0.19444445,
        units: [
          {
            unitSlug: 'the-twisted-tree-fiction-reading',
            unitTitle: "'The Twisted Tree': fiction reading",
            examBoardTitle: null,
            keyStageSlug: 'ks3',
            subjectSlug: 'english',
          },
        ],
      },
    ],
  });
