import { canonicalUrlSchema, oakUrlSchema } from '@/lib/handlers/commonTypes';
import { programmeFactorsSchema } from '@/lib/handlers/programmeFactors';
import * as z from 'zod/v4';

export const lessonSummaryResponseOpenAPISchema = z
  .object({
    lessonTitle: z.string().meta({ description: 'The lesson title' }),
    oakUrl: oakUrlSchema,
    units: z
      .array(
        z.object({
          unitSlug: z
            .string()
            .meta({ description: 'The unit slug identifier' }),
          unitTitle: z.string().meta({ description: 'The unit title' }),
          canonicalUrl: canonicalUrlSchema,
          programmeFactors: programmeFactorsSchema.optional().meta({
            description:
              'The programme-factor values that make this unit entry distinct for the lesson.',
            example: {
              examBoard: {
                slug: 'aqa',
                title: 'AQA',
              },
              pathway: {
                slug: 'gcse',
                title: 'GCSE',
              },
            },
          }),
        }),
      )
      .meta({
        description:
          'The unit contexts that this lesson is part of. Each entry has its own canonical URL and optional programme-factor metadata.',
      }),
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
          response: z
            .string()
            .describe('Suggested teacher response to a common misconception'),
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
      lessonTitle: 'Using vector tools to draw and modify shapes',
      oakUrl:
        'https://www.thenational.academy/teachers/lessons/using-vector-tools-to-draw-and-modify-shapes',
      units: [
        {
          unitSlug: 'developing-vector-graphics',
          unitTitle: 'Developing vector graphics',
          canonicalUrl:
            'https://www.thenational.academy/teachers/programmes/computing-secondary-ks3/units/developing-vector-graphics/lessons/using-vector-tools-to-draw-and-modify-shapes',
        },
      ],
      subjectSlug: 'computing',
      subjectTitle: 'Computing',
      keyStageSlug: 'ks3',
      keyStageTitle: 'Key Stage 3',
      lessonKeywords: [
        {
          keyword: 'vector graphic',
          description: 'an image made up of lines and shapes',
        },
        {
          keyword: 'z-order',
          description: 'the order of overlapping objects',
        },
        {
          keyword: 'layer',
          description:
            'the level on which an object (e.g. text, shapes and photos) can be placed relative to other objects',
        },
      ],
      keyLearningPoints: [
        {
          keyLearningPoint:
            'Vector graphics are made from shapes described by coordinates, not pixels.',
        },
        {
          keyLearningPoint:
            'Vector illustrations are built using simple shapes.',
        },
        {
          keyLearningPoint:
            'Vector graphics use z-order to show which shapes are in front and are visible.',
        },
      ],
      misconceptionsAndCommonMistakes: [
        {
          misconception:
            'Vector graphics are made from pixels and can lose quality when resized.',
          response:
            'Vector graphics are made from lines and shapes. They do not lose quality when resized.',
        },
      ],
      pupilLessonOutcome:
        'I can use software to draw and modify vector shapes.',
      teacherTips: [
        {
          teacherTip:
            'You need to be familiar with the basic tools and features of vector editing software. The Inkscape tutorials may be useful — oak.link/inkscape-tutorials',
        },
      ],
      contentGuidance: null,
      supervisionLevel: null,
      downloadsAvailable: true,
    },
  });
