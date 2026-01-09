import * as z from 'zod/v4';

export const lessonSummaryResponseOpenAPISchema = z
  .object({
    lessonTitle: z.string().meta({ description: 'The lesson title' }),
    unitSlug: z.string().meta({ description: 'The unit slug identifier' }),
    unitTitle: z.string().meta({ description: 'The unit title' }),
    subjectSlug: z
      .string()
      .meta({ description: 'The subject slug identifier' }),
    subjectTitle: z
      .string()
      .meta({ description: 'The subject slug identifier' }),
    keyStageSlug: z
      .string()
      .meta({ description: 'The key stage slug identifier' }),
    keyStageTitle: z.string().meta({ description: 'The key stage title' }),
    lessonKeywords: z
      .array(
        z.object({
          keyword: z.string().meta({ description: 'The keyword' }),
          description: z
            .string()
            .meta({ description: 'A definition of the keyword' }),
        }),
      )
      .meta({ description: "The lesson's keywords and their descriptions" }),
    keyLearningPoints: z
      .array(
        z.object({
          keyLearningPoint: z
            .string()
            .meta({ description: 'A key learning point' }),
        }),
      )
      .meta({ description: "The lesson's key learning points" }),
    misconceptionsAndCommonMistakes: z
      .array(
        z.object({
          misconception: z
            .string()
            .meta({ description: 'A common misconception' }),
          response: z.string({
            description: 'Suggested teacher response to a common misconception',
          }),
        }),
      )
      .meta({
        description:
          'The lesson’s anticipated common misconceptions and suggested teacher responses',
      }),
    pupilLessonOutcome: z.string().optional().meta({
      description: 'Suggested teacher response to a common misconception',
    }),
    teacherTips: z
      .array(
        z
          .object({ teacherTip: z.string() })
          .meta({ description: 'A teaching tip' }),
      )
      .meta({ description: 'Helpful teaching tips for the lesson' }),
    contentGuidance: z
      .array(
        z.object({
          contentGuidanceArea: z
            .string()
            .meta({ description: 'Category of content guidance' }),
          supervisionlevel_id: z.number().meta({
            description:
              'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
          }),
          contentGuidanceLabel: z
            .string()
            .meta({ description: 'Content guidance label' }),
          contentGuidanceDescription: z.string().meta({
            description:
              'A detailed description of the type of content that we suggest needs guidance.',
          }),
        }),
      )
      .or(z.null())
      .meta({
        description:
          'Full guidance about the types of lesson content for the teacher to consider (where appropriate)',
      }),
    supervisionLevel: z.string().or(z.null()).meta({
      description:
        'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
    }),
    downloadsAvailable: z.boolean().meta({
      description:
        'Whether the lesson currently has any downloadable assets availableNote: this field reflects the current availability of downloadable assets, which reflects the availability of early-release content available for the hackathon. All lessons will eventually have downloadable assets available.',
    }),
  })
  .meta({
    id: 'LessonSummaryResponseSchema',
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
