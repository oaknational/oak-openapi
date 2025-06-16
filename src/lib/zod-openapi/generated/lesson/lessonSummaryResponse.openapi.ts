import { z } from 'zod';
import 'zod-openapi/extend';
export const lessonSummaryResponseOpenAPISchema = z.object({
  lessonTitle: z.string().openapi({ example: "Joining using 'and'" }),
  unitSlug: z.string().openapi({ example: 'simple-sentences' }),
  unitTitle: z.string().openapi({ example: 'Simple sentences' }),
  subjectSlug: z.string().openapi({ example: 'english' }),
  subjectTitle: z.string().openapi({ example: 'English' }),
  keyStageSlug: z.string().openapi({ example: 'ks1' }),
  keyStageTitle: z.string().openapi({ example: 'Key Stage 1' }),
  lessonKeywords: z.array(
    z.object({
      keyword: z.string().openapi({ example: 'joining word' }),
      description: z
        .string()
        .openapi({ example: 'a word that joins words or ideas' }),
    }),
  ),
  keyLearningPoints: z.array(
    z.object({
      keyLearningPoint: z
        .string()
        .openapi({ example: 'And is a type of joining word.' }),
    }),
  ),
  misconceptionsAndCommonMistakes: z.array(
    z.object({
      misconception: z
        .string()
        .openapi({
          example: 'Pupils may struggle to link related ideas together.',
        }),
      response: z
        .string()
        .openapi({
          example:
            'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
        }),
    }),
  ),
  pupilLessonOutcome: z
    .string()
    .optional()
    .openapi({ example: "I can join two simple sentences with 'and'." }),
  teacherTips: z.array(
    z.object({
      teacherTip: z
        .string()
        .openapi({
          example:
            'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
        }),
    }),
  ),
  contentGuidance: z
    .array(
      z.object({
        contentGuidanceArea: z.string(),
        supervisionlevel_id: z.number(),
        contentGuidanceLabel: z.string(),
        contentGuidanceDescription: z.string(),
      }),
    )
    .or(z.null())
    .openapi({ example: null }),
  supervisionLevel: z.string().or(z.null()).openapi({ example: null }),
  downloadsAvailable: z.boolean().openapi({ example: true }),
});
