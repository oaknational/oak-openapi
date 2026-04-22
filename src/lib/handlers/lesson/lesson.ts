import groupBy from 'object.groupby';
import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  getClient,
  gql,
  lessonSearchView,
  lessonView,
  unitVariantLessonsView,
} from 'lib/owaClient';
import type {
  LessonSearchView,
  LessonView,
  UnitVariantLessonsView,
} from 'lib/owaClient';
import type * as z from 'zod/v4';
import { errorResponses } from '@/lib/errorResponses';

import {
  blockLessonForCopyrightText,
  checkLessonAllowedAsset,
} from '../../queryGate';
import Timing from '@/lib/serverTimings';

import type { LessonSearchResultType } from './schemas/lessonSearchResponse.schema';

import {
  lessonSearchRequestOpenAPISchema,
  lessonSearchResponseOpenAPISchema,
  lessonSummaryRequestOpenAPISchema,
  lessonSummaryResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/lesson';
import {
  createProgrammeSlug,
  getCanonicalUrlForLesson,
  getOakUrlForLesson,
} from '@/lib/canonicalUrls';
import type { ProgrammeFactors } from '@/lib/handlers/programmeFactors';

// eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
groupBy.shim();

const timing = new Timing();

export const getLessons = router({
  getLesson: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'lesson-data'],
        summary: 'Lesson summary',
        path: '/lessons/{lesson}/summary',
        description: 'This endpoint returns a summary for a given lesson',
        errorResponses,
      },
    })
    .input(lessonSummaryRequestOpenAPISchema)
    .output(lessonSummaryResponseOpenAPISchema)
    .query(async ({ input }) => {
      const slug = decodeURIComponent(input.lesson);
      const client = getClient();

      const blocked = await blockLessonForCopyrightText(client, slug);

      if (blocked.isBlocked()) {
        // blocking actually gets true for a real 404 too, so we're
        // going to do a quick check to see if the lesson exists at all, and if not, we'll return a 404 instead of a 451. This is because we don't want to leak information about what lessons are blocked by returning a different status code for blocked vs non-existent lessons.

        const existsQuery = gql`
          query ($slug: String!) @cached(ttl: 300) {
            ${lessonView}(
              where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
            ) {
              lessonSlug
            }
          }
        `;

        const existsRes: LessonView = await client.request(existsQuery, {
          slug,
        });

        if (existsRes[lessonView].length === 0) {
          // lesson doesn't exist - return 404
          throw new TRPCError({
            message: 'Lesson not found',
            code: 'NOT_FOUND',
          });
        }

        throw new TRPCError({
          message: `Lesson (${slug}) not available for this query (blocked for copyright text)`,
          code: 'BAD_REQUEST',
          cause: blocked.reason,
        });
      }

      const query = gql`
        query ($slug: String!) @cached(ttl: 300) {
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
            downloadsAvailable: hasDownloadableResources
            supervisionLevel
            programmeSlug
            examBoardSlug
            examBoardTitle
            tierSlug
            tierTitle
          }
        }
      `;

      timing.start('getLesson graphql');
      const res: LessonView = await client.request(query, {
        slug,
      });
      timing.end('getLesson graphql');

      const data = res[lessonView];

      if (data.length === 0) {
        throw new TRPCError({
          message: 'Lesson not found',
          code: 'NOT_FOUND',
        });
      }

      try {
        const variantQuery = gql`
          query ($slug: String!) @cached(ttl: 300) {
            ${unitVariantLessonsView}(
              where: { lesson_slug: { _eq: $slug }, is_legacy: { _eq: false } }
            ) {
              lesson_slug
              unit_slug
              unit_title: unit_data(path: "title")
              examboard_slug: programme_fields(path: "examboard_slug")
              examboard_title: programme_fields(path: "examboard")
              pathway_slug: programme_fields(path: "pathway_slug")
              pathway_title: programme_fields(path: "pathway")
              tier_slug: programme_fields(path: "tier_slug")
              tier_title: programme_fields(path: "tier")
            }
          }
        `;

        const variantRes: UnitVariantLessonsView = await client.request(
          variantQuery,
          {
            slug,
          },
        );

        const lessonRecord = data
          .toSorted((a, b) => {
            const aKey = [
              a.unitSlug || '',
              a.programmeSlug || '',
              a.examBoardSlug || '',
              a.tierSlug || '',
            ].join('|');
            const bKey = [
              b.unitSlug || '',
              b.programmeSlug || '',
              b.examBoardSlug || '',
              b.tierSlug || '',
            ].join('|');

            return aKey.localeCompare(bKey);
          })
          .at(0);

        if (!lessonRecord) {
          throw new Error('Lesson not found');
        }

        if (
          !lessonRecord.lessonTitle ||
          !lessonRecord.subjectSlug ||
          !lessonRecord.subjectTitle ||
          !lessonRecord.keyStageSlug ||
          !lessonRecord.keyStageTitle
        ) {
          throw new Error('Lesson is missing required summary metadata');
        }

        const lessonTitle = lessonRecord.lessonTitle;
        const subjectSlug = lessonRecord.subjectSlug;
        const subjectTitle = lessonRecord.subjectTitle;
        const keyStageSlug = lessonRecord.keyStageSlug;
        const keyStageTitle = lessonRecord.keyStageTitle;

        // A unit variant slug looks like "foo-630" and belongs to a "unit
        // options group" parent "foo".  The parent slug is an umbrella that
        // doesn't have its own programme page, so if a variant exists for a
        // given lesson we drop the parent row to avoid emitting a canonical
        // URL that 404s.
        const allVariants = variantRes[unitVariantLessonsView];
        const parentSlugsWithVariant = new Set(
          allVariants
            .map((v) => v.unit_slug.match(/^(.*)-\d+$/)?.[1])
            .filter((parent): parent is string => Boolean(parent)),
        );
        const variants = allVariants.filter(
          (v) => !parentSlugsWithVariant.has(v.unit_slug),
        );

        const dedupedUnits = new Map<
          string,
          z.infer<typeof lessonSummaryResponseOpenAPISchema>['units'][number]
        >();

        for (const variant of variants) {
          const key = [
            variant.unit_slug,
            variant.unit_title,
            variant.examboard_slug ?? '',
            variant.pathway_slug ?? '',
            variant.tier_slug ?? '',
          ].join('|');

          if (dedupedUnits.has(key)) {
            continue;
          }

          const programmeFactors = {
            examBoard:
              variant.examboard_slug && variant.examboard_title
                ? {
                    slug: variant.examboard_slug,
                    title: variant.examboard_title,
                  }
                : undefined,
            pathway:
              variant.pathway_slug && variant.pathway_title
                ? {
                    slug: variant.pathway_slug,
                    title: variant.pathway_title,
                  }
                : undefined,
            tier:
              variant.tier_slug && variant.tier_title
                ? {
                    slug: variant.tier_slug,
                    title: variant.tier_title,
                  }
                : undefined,
          } satisfies ProgrammeFactors;

          const hasProgrammeFactors =
            Object.values(programmeFactors).some(Boolean);
          const programmeSlug = createProgrammeSlug(
            lessonRecord.subjectSlug || '',
            lessonRecord.keyStageSlug || '',
            variant.examboard_slug,
            variant.tier_slug,
            variant.pathway_slug,
          );

          dedupedUnits.set(key, {
            unitSlug: variant.unit_slug,
            unitTitle: variant.unit_title,
            canonicalUrl: getCanonicalUrlForLesson(
              slug,
              variant.unit_slug,
              programmeSlug,
            ),
            programmeFactors: hasProgrammeFactors
              ? programmeFactors
              : undefined,
          });
        }

        // The variant query is the authoritative source for unit–lesson
        // relationships with full programme-factor data.  The lessonView rows
        // lack pathway fields, so we only fall back to them for units that
        // the variant query didn't already cover for the same
        // unitSlug + examBoard + tier combination.
        const coveredVariantKeys = new Set(
          Array.from(dedupedUnits.values()).map(
            (u) =>
              `${u.unitSlug}|${u.programmeFactors?.examBoard?.slug ?? ''}|${u.programmeFactors?.tier?.slug ?? ''}`,
          ),
        );

        for (const row of data) {
          if (!row.unitSlug || !row.unitTitle) {
            continue;
          }

          if (parentSlugsWithVariant.has(row.unitSlug)) {
            continue;
          }

          const variantKey = `${row.unitSlug}|${row.examBoardSlug ?? ''}|${row.tierSlug ?? ''}`;
          if (coveredVariantKeys.has(variantKey)) {
            continue;
          }

          const programmeSlug =
            row.programmeSlug ||
            createProgrammeSlug(
              row.subjectSlug || '',
              row.keyStageSlug || '',
              row.examBoardSlug,
              row.tierSlug,
            );
          const key = [
            row.unitSlug,
            row.unitTitle,
            row.examBoardSlug ?? '',
            row.tierSlug ?? '',
          ].join('|');

          if (dedupedUnits.has(key)) {
            continue;
          }

          const programmeFactors = {
            examBoard:
              row.examBoardSlug && row.examBoardTitle
                ? {
                    slug: row.examBoardSlug,
                    title: row.examBoardTitle,
                  }
                : undefined,
            tier:
              row.tierSlug && row.tierTitle
                ? {
                    slug: row.tierSlug,
                    title: row.tierTitle,
                  }
                : undefined,
          } satisfies ProgrammeFactors;
          const hasProgrammeFactors =
            Object.values(programmeFactors).some(Boolean);

          dedupedUnits.set(key, {
            unitSlug: row.unitSlug,
            unitTitle: row.unitTitle,
            canonicalUrl: getCanonicalUrlForLesson(
              slug,
              row.unitSlug,
              programmeSlug,
            ),
            programmeFactors: hasProgrammeFactors
              ? programmeFactors
              : undefined,
          });

          coveredVariantKeys.add(variantKey);
        }

        const lessonKeywords =
          lessonSummaryResponseOpenAPISchema.shape.lessonKeywords.parse(
            lessonRecord.lessonKeywords ?? [],
          );
        const keyLearningPoints =
          lessonSummaryResponseOpenAPISchema.shape.keyLearningPoints.parse(
            lessonRecord.keyLearningPoints ?? [],
          );
        const misconceptionsAndCommonMistakes =
          lessonSummaryResponseOpenAPISchema.shape.misconceptionsAndCommonMistakes.parse(
            lessonRecord.misconceptionsAndCommonMistakes ?? [],
          );
        const teacherTips =
          lessonSummaryResponseOpenAPISchema.shape.teacherTips.parse(
            lessonRecord.teacherTips ?? [],
          );
        const contentGuidance =
          lessonSummaryResponseOpenAPISchema.shape.contentGuidance.parse(
            lessonRecord.contentGuidance ?? null,
          );

        const lesson: z.infer<typeof lessonSummaryResponseOpenAPISchema> = {
          lessonTitle,
          oakUrl: getOakUrlForLesson(slug),
          units: Array.from(dedupedUnits.values()).toSorted((a, b) => {
            return (
              a.unitSlug.localeCompare(b.unitSlug) ||
              (a.programmeFactors?.examBoard?.slug || '').localeCompare(
                b.programmeFactors?.examBoard?.slug || '',
              ) ||
              (a.programmeFactors?.pathway?.slug || '').localeCompare(
                b.programmeFactors?.pathway?.slug || '',
              ) ||
              (a.programmeFactors?.tier?.slug || '').localeCompare(
                b.programmeFactors?.tier?.slug || '',
              )
            );
          }),
          subjectSlug,
          subjectTitle,
          keyStageSlug,
          keyStageTitle,
          lessonKeywords,
          keyLearningPoints,
          misconceptionsAndCommonMistakes,
          pupilLessonOutcome: lessonRecord.pupilLessonOutcome,
          teacherTips,
          contentGuidance,
          downloadsAvailable: lessonRecord.downloadsAvailable ?? false,
          supervisionLevel: lessonRecord.supervisionLevel ?? null,
        };

        // we need to loop through the lessons and change the downloadsAvailable
        // to check against the blockedLessons list. Ideally this would come from
        // the database, but currently it's not available and some parts of the
        // restricted flags are not fully implemented in the database
        if (lesson.downloadsAvailable) {
          const isBlockedForDownloads = await checkLessonAllowedAsset({
            client,
            lessonSlug: slug,
          });

          if (isBlockedForDownloads.isBlocked()) {
            lesson.downloadsAvailable = false;
          }
        }

        lessonSummaryResponseOpenAPISchema.parse(lesson);

        return lesson;
      } catch (error) {
        throw new TRPCError({
          message: 'Internal server error',
          code: 'INTERNAL_SERVER_ERROR',
          cause: error,
        });
      }
    }),
  searchByTextSimilarity: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['lessons', 'search'],
        path: '/search/lessons',
        summary: 'Lesson search using lesson title',
        description:
          'Search for a term and find the 20 most similar lessons with titles that contain similar text.',
        errorResponses,
      },
    })
    .input(lessonSearchRequestOpenAPISchema)
    .output(lessonSearchResponseOpenAPISchema)
    .query(async ({ input }) => {
      // store q from input.q and sanitize for use as an sql query:
      const q = input.q;
      const unit = input.unit || null;
      const subject = input.subject || null;
      const keyStage = input.keyStage || null;

      interface SearchArgs {
        filter_keystage_slug?: string;
        filter_subject_slug?: string;
        filter_unit_slug?: string;
        search_term: string;
      }

      const args: SearchArgs = {
        search_term: q,
      };

      if (unit) {
        args.filter_unit_slug = unit;
      }

      if (subject) {
        args.filter_subject_slug = subject;
      }

      if (keyStage) {
        args.filter_keystage_slug = keyStage;
      }

      const client = getClient();

      const searchQuery = gql`
        query ($search_term: String!, $filter_unit_slug: String, $filter_subject_slug: String, $filter_keystage_slug: String) {
          ${lessonSearchView}(args: {
            search_term: $search_term,
            filter_unit_slug: $filter_unit_slug,
            filter_subject_slug: $filter_subject_slug,
            filter_keystage_slug: $filter_keystage_slug,
          }) {
            lessonSlug
            similarity
          }
        }
      `;

      const result: LessonSearchView = await client.request(searchQuery, {
        ...args,
      });

      const slugs = result[lessonSearchView].map(({ lessonSlug }) => {
        return lessonSlug;
      });

      type SimilarityMap = Record<string, number>;

      const similarity: SimilarityMap = result[lessonSearchView].reduce(
        (acc, { lessonSlug, similarity: sim }) => {
          acc[lessonSlug] = sim;
          return acc;
        },
        {} as SimilarityMap,
      );

      // reality is that this is never going to be string[]
      const variables: Record<string, string | number | string[]> = { slugs };

      const _and: string[] = ['lessonSlug: { _in: $slugs }'];
      const queryArgs = [];

      if (unit) {
        _and.push('unitSlug: { _eq: $unit }');
        queryArgs.push('$unit: String');
        variables.unit = unit;
      }

      if (subject) {
        _and.push('subjectSlug: { _eq: $subject }');
        queryArgs.push('$subject: String');
        variables.subject = subject;
      }

      if (keyStage) {
        _and.push('keyStageSlug: { _eq: $keyStage }');
        queryArgs.push('$keyStage: String');
        variables.keyStage = keyStage;
      }

      const where = `, _and: { ${_and.join(',')}}`;

      const query = gql`
        query ($slugs: [String!]!, ${queryArgs.join(',')}) {
          ${lessonView}(where: {${where}}) {
            lessonSlug
            lessonTitle
            keyStageSlug
            subjectSlug
            unitSlug
            unitTitle
            examBoardTitle
          }
        }
      `;

      interface LessonResult {
        lessonSlug: string;
        lessonTitle: string;
        keyStageSlug: string;
        subjectSlug: string;
        unitSlug: string;
        unitTitle: string;
        examBoardTitle: string;
      }

      interface LessonQueryResult {
        [lessonView]: LessonResult[];
      }

      const res: LessonQueryResult = await client.request(query, variables);

      if (res[lessonView].length === 0) {
        throw new TRPCError({
          message: 'No lessons found',
          code: 'NOT_FOUND',
        });
      }

      const groupedByLesson = Object.values(
        Object.groupBy(res[lessonView], ({ lessonSlug }) => lessonSlug),
      );

      return groupedByLesson
        .reduce((acc, res) => {
          // I can't see how this is ever true, but it's a TS thing.
          if (!res) {
            return acc;
          }

          const { lessonSlug, lessonTitle } = res[0];

          const units = res.map((_) => {
            return {
              unitSlug: _.unitSlug,
              unitTitle: _.unitTitle,
              examBoardTitle: _.examBoardTitle,
              keyStageSlug: _.keyStageSlug,
              subjectSlug: _.subjectSlug,
            };
          });

          acc.push({
            lessonSlug,
            lessonTitle,
            oakUrl: getOakUrlForLesson(lessonSlug),
            similarity: similarity[lessonSlug],
            units,
          });

          return acc;
        }, [] as LessonSearchResultType[])
        .toSorted((a, b) => b.similarity - a.similarity);
    }),
});
