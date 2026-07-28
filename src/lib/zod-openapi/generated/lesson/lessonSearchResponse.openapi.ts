import 'zod-openapi';
import * as z from 'zod/v4';
import { oakUrlSchema } from '../../../handlers/commonTypes';
export const lessonSearchResultSchema = z.object({
  lessonSlug: z.string().meta({
    description: 'The lesson slug identifier',
  }),
  lessonTitle: z.string().meta({
    description: 'The lesson title',
  }),
  oakUrl: oakUrlSchema,
  similarity: z.number().meta({
    description: 'The snippet of the transcript that matched the search term',
  }),
  units: z
    .array(
      z.object({
        unitSlug: z.string(),
        unitTitle: z.string(),
        examBoardTitle: z.string().or(z.null()),
        keyStageSlug: z.string(),
        subjectSlug: z.string(),
      }),
    )
    .meta({
      description:
        'The units that the lesson is part of. See sample response below',
    }),
});
export const lessonSearchResponseOpenAPISchema = z
  .array(lessonSearchResultSchema)
  .meta({
    id: 'LessonSearchResponseSchema',
    example: [
      {
        lessonSlug: 'performing-your-chosen-gothic-poem',
        lessonTitle: 'Performing your chosen Gothic poem',
        oakUrl:
          'https://www.thenational.academy/teachers/lessons/performing-your-chosen-gothic-poem',
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
        oakUrl:
          'https://www.thenational.academy/teachers/lessons/the-twisted-tree-the-novel-as-a-gothic-text',
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
