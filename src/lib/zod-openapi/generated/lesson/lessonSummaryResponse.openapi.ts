import 'zod-openapi';
import * as z from 'zod/v4';
import {
  canonicalUrlSchema,
  oakUrlSchema,
} from '../../../handlers/commonTypes';
import { unitProgrammeFactorsSchema } from '@/lib/handlers/unitProgrammeFactors';
export const lessonSummaryResponseOpenAPISchema = z
  .object({
    lessonTitle: z.string().meta({
      description: 'The lesson title',
      example: 'Using vector tools to draw and modify shapes',
    }),
    canonicalUrl: canonicalUrlSchema.meta({
      example:
        'https://www.thenational.academy/teachers/lessons/using-vector-tools-to-draw-and-modify-shapes',
    }),
    oakUrl: oakUrlSchema.meta({
      example:
        'https://www.thenational.academy/teachers/lessons/using-vector-tools-to-draw-and-modify-shapes',
    }),
    units: z
      .array(
        z.object({
          unitSlug: z.string().meta({
            description: 'The unit slug identifier',
            example: 'developing-vector-graphics',
          }),
          unitTitle: z.string().meta({
            description: 'The unit title',
            example: 'Developing vector graphics',
          }),
          programmeFactors: unitProgrammeFactorsSchema
            .describe(
              'The programme-factor values that identify which variant of the unit this lesson sits in. Omitted when the unit has no programme factors.',
            )
            .optional(),
        }),
      )
      .meta({
        description:
          'All the units (including programme variants) this lesson is part of. Each entry is a unique combination of unit slug and programme factors.',
        example: [
          {
            unitSlug: 'developing-vector-graphics',
            unitTitle: 'Developing vector graphics',
          },
        ],
      }),
    subjectSlug: z.string().meta({
      description: 'The subject slug identifier',
      example: 'computing',
    }),
    subjectTitle: z.string().meta({
      description: 'The subject slug identifier',
      example: 'Computing',
    }),
    keyStageSlug: z.string().meta({
      description: 'The key stage slug identifier',
      example: 'ks3',
    }),
    keyStageTitle: z.string().meta({
      description: 'The key stage title',
      example: 'Key Stage 3',
    }),
    lessonKeywords: z
      .array(
        z.object({
          keyword: z.string().meta({
            description: 'The keyword',
            example: 'vector graphic',
          }),
          description: z.string().meta({
            description: 'A definition of the keyword',
            example: 'an image made up of lines and shapes',
          }),
        }),
      )
      .meta({
        description: "The lesson's keywords and their descriptions",
        example: [
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
      }),
    keyLearningPoints: z
      .array(
        z.object({
          keyLearningPoint: z.string().meta({
            description: 'A key learning point',
            example:
              'Vector graphics are made from shapes described by coordinates, not pixels.',
          }),
        }),
      )
      .meta({
        description: "The lesson's key learning points",
        example: [
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
      }),
    misconceptionsAndCommonMistakes: z
      .array(
        z.object({
          misconception: z.string().meta({
            description: 'A common misconception',
            example:
              'Vector graphics are made from pixels and can lose quality when resized.',
          }),
          response: z
            .string()
            .describe('Suggested teacher response to a common misconception')
            .meta({
              example:
                'Vector graphics are made from lines and shapes. They do not lose quality when resized.',
            }),
        }),
      )
      .meta({
        description:
          'The lesson’s anticipated common misconceptions and suggested teacher responses',
        example: [
          {
            misconception:
              'Vector graphics are made from pixels and can lose quality when resized.',
            response:
              'Vector graphics are made from lines and shapes. They do not lose quality when resized.',
          },
        ],
      }),
    pupilLessonOutcome: z.string().optional().meta({
      description: 'Suggested teacher response to a common misconception',
      example: 'I can use software to draw and modify vector shapes.',
    }),
    teacherTips: z
      .array(
        z
          .object({
            teacherTip: z.string().meta({
              example:
                'You need to be familiar with the basic tools and features of vector editing software. The Inkscape tutorials may be useful \u2014 oak.link/inkscape-tutorials',
            }),
          })
          .meta({
            description: 'A teaching tip',
          }),
      )
      .meta({
        description: 'Helpful teaching tips for the lesson',
        example: [
          {
            teacherTip:
              'You need to be familiar with the basic tools and features of vector editing software. The Inkscape tutorials may be useful \u2014 oak.link/inkscape-tutorials',
          },
        ],
      }),
    contentGuidance: z
      .array(
        z.object({
          contentGuidanceArea: z.string().meta({
            description: 'Category of content guidance',
          }),
          supervisionlevel_id: z.number().meta({
            description:
              'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
          }),
          contentGuidanceLabel: z.string().meta({
            description: 'Content guidance label',
          }),
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
        example: null,
      }),
    supervisionLevel: z.string().or(z.null()).meta({
      description:
        'The ID of the supervision level for the identified type of content. See ‘What are the types of content guidance?’ for more information.',
      example: null,
    }),
    downloadsAvailable: z.boolean().meta({
      description:
        'Whether the lesson currently has any downloadable assets available.',
      example: true,
    }),
  })
  .meta({
    id: 'LessonSummaryResponseSchema',
    example: {
      lessonTitle: 'Using vector tools to draw and modify shapes',
      canonicalUrl:
        'https://www.thenational.academy/teachers/lessons/using-vector-tools-to-draw-and-modify-shapes',
      oakUrl:
        'https://www.thenational.academy/teachers/lessons/using-vector-tools-to-draw-and-modify-shapes',
      units: [
        {
          unitSlug: 'developing-vector-graphics',
          unitTitle: 'Developing vector graphics',
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
            'You need to be familiar with the basic tools and features of vector editing software. The Inkscape tutorials may be useful \u2014 oak.link/inkscape-tutorials',
        },
      ],
      contentGuidance: null,
      supervisionLevel: null,
      downloadsAvailable: true,
    },
  });
