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
    subjectTitle: z
      .string()
      .openapi({ description: 'The subject slug identifier' }),
    keyStageSlug: z
      .string()
      .openapi({ description: 'The key stage slug identifier' }),
    keyStageTitle: z.string().openapi({ description: 'The key stage title' }),
    lessonKeywords: z
      .array(
        z.object({
          keyword: z.string().openapi({ description: 'The keyword' }),
          description: z
            .string()
            .openapi({ description: 'A definition of the keyword' }),
        }),
      )
      .openapi({ description: "The lesson's keywords and their descriptions" }),
    keyLearningPoints: z
      .array(
        z.object({
          keyLearningPoint: z
            .string()
            .openapi({ description: 'A key learning point' }),
        }),
      )
      .openapi({ description: "The lesson's key learning points" }),
    misconceptionsAndCommonMistakes: z
      .array(
        z.object({
          misconception: z
            .string()
            .openapi({ description: 'A common misconception' }),
          response: z.string({
            description: 'Suggested teacher response to a common misconception',
          }),
        }),
      )
      .openapi({
        description:
          'The lesson’s anticipated common misconceptions and suggested teacher responses',
      }),
    pupilLessonOutcome: z.string().optional().openapi({
      description: 'Suggested teacher response to a common misconception',
    }),
    teacherTips: z
      .array(
        z
          .object({ teacherTip: z.string() })
          .openapi({ description: 'A teaching tip' }),
      )
      .openapi({ description: 'Helpful teaching tips for the lesson' }),
    contentGuidance: z
      .array(
        z.object({
          contentGuidanceArea: z
            .string()
            .openapi({ description: 'Category of content guidance' }),
          supervisionlevel_id: z.number().openapi({
            description:
              'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
          }),
          contentGuidanceLabel: z
            .string()
            .openapi({ description: 'Content guidance label' }),
          contentGuidanceDescription: z.string().openapi({
            description:
              'A detailed description of the type of content that we suggest needs guidance.',
          }),
        }),
      )
      .or(z.null())
      .openapi({
        description:
          'Full guidance about the types of lesson content for the teacher to consider (where appropriate)',
      }),
    supervisionLevel: z.string().or(z.null()).openapi({
      description:
        'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
    }),
    downloadsAvailable: z.boolean().openapi({
      description:
        'Whether the lesson currently has any downloadable assets availableNote: this field reflects the current availability of downloadable assets, which reflects the availability of early-release content available for the hackathon. All lessons will eventually have downloadable assets available.',
    }),
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
