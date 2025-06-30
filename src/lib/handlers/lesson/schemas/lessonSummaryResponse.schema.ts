import { z } from 'zod';
import 'zod-openapi/extend';
export const lessonSummaryResponseSchema = z.object({
  lessonTitle: z.string(),
  unitSlug: z.string(),
  unitTitle: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  keyStageSlug: z.string(),
  keyStageTitle: z.string(),
  lessonKeywords: z.array(
    z.object({ keyword: z.string(), description: z.string() }),
  ),
  keyLearningPoints: z.array(z.object({ keyLearningPoint: z.string() })),
  misconceptionsAndCommonMistakes: z.array(
    z.object({ misconception: z.string(), response: z.string() }),
  ),
  pupilLessonOutcome: z.string().optional(),
  teacherTips: z.array(z.object({ teacherTip: z.string() })),
  contentGuidance: z
    .array(
      z.object({
        contentGuidanceArea: z.string(),
        supervisionlevel_id: z.number(),
        contentGuidanceLabel: z.string(),
        contentGuidanceDescription: z.string(),
      }),
    )
    .or(z.null()),
  supervisionLevel: z.string().or(z.null()),
  downloadsAvailable: z.boolean(),
});

export type LessonSummaryResponseType = z.infer<
  typeof lessonSummaryResponseSchema
>;
