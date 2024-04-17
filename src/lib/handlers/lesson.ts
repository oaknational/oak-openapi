import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import { LessonView, getClient, gql, lessonView } from 'lib/owaClient';
import { z } from 'zod';

const lessonSummary = z.object({
  lessonTitle: z.string(),
  unitSlug: z.string(),
  unitTitle: z.string(),
  subjectSlug: z.string(),
  subjectTitle: z.string(),
  keyStageSlug: z.string(),
  keyStageTitle: z.string(),
  lessonKeywords: z.array(
    z.object({ keyword: z.string(), description: z.string() })
  ),
  keyLearningPoints: z.array(z.object({ keyLearningPoint: z.string() })),
  misconceptionsAndCommonMistakes: z.array(
    z.object({ misconception: z.string(), response: z.string() })
  ),
  pupilLessonOutcome: z.string().optional(),
  teacherTips: z.array(z.object({ teacherTip: z.string() })),
  contentGuidance: z.array(
    z.object({
      contentGuidanceArea: z.string(),
      supervisionlevel_id: z.number(),
      contentGuidanceLabel: z.string(),
      contentGuidanceDescription: z.string(),
    })
  ),
  supervisionLevel: z.string(),
  hasDownloadableResources: z.boolean(),
});

type LessonSummary = z.infer<typeof lessonSummary>;

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons'],
        path: '/lessons/{lesson}/summary',
        description: 'Get a summary of the specified lesson',
      },
    })
    .input(
      z.object({
        lesson: z.string({ description: 'The slug of the lesson' }),
      })
    )
    .output(lessonSummary)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);

      const client = getClient();

      const query = gql`
        query ($slug: String!) {
          ${lessonView}(
            where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
          ) {
            lessonTitle
            unitSlug
            unitTitle
            subjectSlug
            subjectTitle
            keyStageSlug
            keyStageTitle
            lessonKeywords
            keyLearningPoints
            misconceptionsAndCommonMistakes
            pupilLessonOutcome
            teacherTips
            contentGuidance
            hasDownloadableResources
            supervisionLevel
          }
        }
      `;

      const res: LessonView = await client.request(query, {
        slug,
      });

      const data = res[lessonView];

      if (data.length === 0) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      const lesson = data[0] as LessonSummary;
      return lesson;
    }),
});
