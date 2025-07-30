import { z } from 'zod';
import 'zod-openapi/extend';
export const lessonSummaryResponseOpenAPISchema = z
  .object({
    lessonTitle: z.string().openapi({ description: 'The lesson title' }),
    unitSlug: z.string().openapi({ description: 'The unit slug identifier' }),
    unitTitle: z.string().openapi({ description: 'The unit title' }),
    subjectSlug: z
      .string()
      .openapi({ description: 'The subject slug identifier' }),
    subjectTitle: z.string().openapi({ description: 'The subject title' }),
    keyStageSlug: z.string(),
    keyStageTitle: z.string(),
    lessonKeywords: z
      .array(z.object({ keyword: z.string(), description: z.string() }))
      .openapi({ description: 'A list of keywords and descriptions' }),
    keyLearningPoints: z
      .array(z.object({ keyLearningPoint: z.string() }))
      .openapi({ description: 'A list of key learning pointss' }),
    misconceptionsAndCommonMistakes: z
      .array(z.object({ misconception: z.string(), response: z.string() }))
      .openapi({ description: 'A list of misconceptions and responses' }),
    pupilLessonOutcome: z.string().optional(),
    teacherTips: z
      .array(z.object({ teacherTip: z.string() }))
      .openapi({ description: 'A list of teacher tipss' }),
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
  })
  .openapi({
    example: {
      lessonTitle: "Joining using 'and'",
      unitSlug: 'simple-sentences',
      unitTitle: 'Simple sentences',
      subjectSlug: 'english',
      subjectTitle: 'English',
      keyStageSlug: 'ks1',
      keyStageTitle: 'Key Stage 1',
      lessonKeywords: [
        {
          keyword: 'joining word',
          description: 'a word that joins words or ideas',
        },
        { keyword: 'build on', description: 'add to' },
        { keyword: 'related', description: 'linked to' },
      ],
      keyLearningPoints: [
        { keyLearningPoint: 'And is a type of joining word.' },
        { keyLearningPoint: 'A joining word can join two simple sentences.' },
        {
          keyLearningPoint:
            'Each simple sentence is about one idea and makes complete sense.',
        },
        {
          keyLearningPoint:
            'The second idea builds on to the first idea if \u2018and\u2019 is used to join them.',
        },
        {
          keyLearningPoint:
            'Grammatically accurate sentences start with capital letters and most often end with full stops.',
        },
      ],
      misconceptionsAndCommonMistakes: [
        {
          misconception: 'Pupils may struggle to link related ideas together.',
          response:
            'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
        },
      ],
      pupilLessonOutcome: "I can join two simple sentences with 'and'.",
      teacherTips: [
        {
          teacherTip:
            'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
        },
      ],
      contentGuidance: null,
      supervisionLevel: null,
      downloadsAvailable: true,
    },
    ref: 'LessonSummaryResponseSchema',
  });
