import { z } from 'zod';
import 'zod-openapi/extend';
export const lessonSummaryResponseOpenAPISchema = z
  .object({
    lessonTitle: z.string().openapi({ example: "Joining using 'and'" }),
    unitSlug: z.string().openapi({ example: 'simple-sentences' }),
    unitTitle: z.string().openapi({ example: 'Simple sentences' }),
    subjectSlug: z.string().openapi({ example: 'english' }),
    subjectTitle: z.string().openapi({ example: 'English' }),
    keyStageSlug: z.string().openapi({ example: 'ks1' }),
    keyStageTitle: z.string().openapi({ example: 'Key Stage 1' }),
    lessonKeywords: z
      .array(
        z
          .object({
            keyword: z.string().openapi({ example: 'joining word' }),
            description: z
              .string()
              .openapi({ example: 'a word that joins words or ideas' }),
          })
          .openapi({
            example: {
              keyword: 'joining word',
              description: 'a word that joins words or ideas',
            },
          }),
      )
      .openapi({
        example: [
          {
            keyword: 'joining word',
            description: 'a word that joins words or ideas',
          },
          { keyword: 'build on', description: 'add to' },
          { keyword: 'related', description: 'linked to' },
        ],
      }),
    keyLearningPoints: z
      .array(
        z
          .object({
            keyLearningPoint: z
              .string()
              .openapi({ example: 'And is a type of joining word.' }),
          })
          .openapi({
            example: { keyLearningPoint: 'And is a type of joining word.' },
          }),
      )
      .openapi({
        example: [
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
      }),
    misconceptionsAndCommonMistakes: z
      .array(
        z
          .object({
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
          })
          .openapi({
            example: {
              misconception:
                'Pupils may struggle to link related ideas together.',
              response:
                'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
            },
          }),
      )
      .openapi({
        example: [
          {
            misconception:
              'Pupils may struggle to link related ideas together.',
            response:
              'Give some non-examples to show what it sounds like when two ideas are unrelated e.g. Dad baked bread and she missed her sister.',
          },
        ],
      }),
    pupilLessonOutcome: z
      .string()
      .optional()
      .openapi({ example: "I can join two simple sentences with 'and'." }),
    teacherTips: z
      .array(
        z
          .object({
            teacherTip: z
              .string()
              .openapi({
                example:
                  'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
              }),
          })
          .openapi({
            example: {
              teacherTip:
                'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
            },
          }),
      )
      .openapi({
        example: [
          {
            teacherTip:
              'In Learning Cycle 1, make sure pupils are given plenty of opportunities to say sentences orally and hear that they make complete sense.',
          },
        ],
      }),
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
  });
