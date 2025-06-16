import 'zod-openapi/extend';
import z from 'zod';

export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string(),
  lessonTitle: z.string(),
  similarity: z.number(),
  units: z.array(
    z.object({
      unitSlug: z.string(),
      unitTitle: z.string(),
      examBoardTitle: z.string().or(z.null()),
      keyStageSlug: z.string(),
      subjectSlug: z.string(),
    }),
  ),
});

export type LessonSearchResultType = z.infer<typeof lessonSearchResultSchema>;

export const lessonSearchResponseOpenAPISchema = z
  .array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      similarity: z.number(),
      units: z.array(
        z.object({
          unitSlug: z.string(),
          unitTitle: z.string(),
          examBoardTitle: z.string().or(z.null()),
          keyStageSlug: z.string(),
          subjectSlug: z.string(),
        }),
      ),
    }),
  )
  .openapi({
    example: [
      {
        lessonSlug: 'descriptive-writing-about-a-small-detail',
        lessonTitle: 'Writing a gothic description',
        similarity: 0.2413793,
        units: [
          {
            unitSlug: 'a-monster-within-reading-gothic-fiction',
            unitTitle: 'A monster within: reading and writing Gothic fiction',
            examBoardTitle: null,
            keyStageSlug: 'ks3',
            subjectSlug: 'english',
          },
        ],
      },
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

export type LessonSearchResponseType = z.infer<
  typeof lessonSearchResponseSchema
>;
