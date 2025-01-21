import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  SequenceView,
  UnitCurriculumView,
  UnitVariantLessonsView,
  getClient,
  gql,
  sequenceView,
  unitCurriculumView,
  unitVariantLessonsView,
} from 'lib/owaClient';
import { z } from 'zod';
import { blockUnitForCopyrightText } from '../queryGate';
import Timing from '../serverTimings';
import { defaultCaching } from '../networkCache';

const timing = new Timing();

export const unitSchema = z.object({
  unitSlug: z.string(),
  unitTitle: z.string(),
  tags: z.array(z.string()),
  // unitOrder: z.number().optional(),
  yearSlug: z.string(),
  year: z.number(),
  phaseSlug: z.string(),
  subjectSlug: z.string(),
  keyStageSlug: z.string(),
  // notes: z.string(),
  description: z.string().optional(),
  // plannedNumberOfLessons: z.number(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  whyThisWhyNow: z.string().optional(),
  // priorUnit: z.object({
  //   description: z.string(),
  //   units: z.array(z.object({ unitSlug: z.string(), unitTitle: z.string() })),
  // }),
  // futureUnit: z.object({
  //   description: z.string(),
  //   units: z.array(z.object({ unitSlug: z.string(), unitTitle: z.string() })),
  // }),
  unitLessons: z.array(
    z.object({
      lessonSlug: z.string(),
      lessonTitle: z.string(),
      lessonOrder: z.number().optional(),
    }),
  ),
});

type UnitSchema = z.infer<typeof unitSchema>;

export const getUnits = router({
  getUnit: protectedProcedure
    .use(defaultCaching)
    .meta({
      openapi: {
        method: 'GET',
        tags: ['units'],
        path: '/units/{unit}/summary',
        description:
          'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
        example: {
          request: {
            unit: 'simple-compound-and-adverbial-complex-sentences',
          },
          response: {
            unitSlug: 'simple-compound-and-adverbial-complex-sentences',
            unitTitle: 'Simple, compound and adverbial complex sentences',
            tags: ['Grammar'],
            priorKnowledgeRequirements: [
              'A simple sentence is about one idea and makes complete sense.',
              'Any simple sentence contains one verb and at least one noun.',
              'Two simple sentences can be joined with a co-ordinating conjunction to form a compound sentence.',
            ],
            nationalCurriculumContent: [
              'Ask relevant questions to extend their understanding and knowledge',
              'Articulate and justify answers, arguments and opinions',
              'Speak audibly and fluently with an increasing command of Standard English',
            ],
            priorUnit: {
              description:
                "In 'Adverbial complex sentences', pupils built on from co-ordination to how to stretch a simple sentence with subordination and a second idea. In this unit, pupils will learn that the position of the subordinate clause in an adverbial complex sentence can vary.",
              units: [
                {
                  unitSlug: 'adverbial-complex-sentences',
                  unitTitle: 'Adverbial complex sentences',
                },
              ],
            },
            futureUnit: {
              description:
                "In this unit, pupils learn that the position of the subordinate clause in an adverbial complex sentence can vary. In 'Simple and progressive tense forms', pupils will write a variety of sentence structures in different tenses.",
              units: [
                {
                  unitSlug: 'tense-forms-simple-progressive-and-perfect',
                  unitTitle: 'Tense forms: simple, progressive and perfect',
                },
              ],
            },
            unitLessons: [
              {
                lessonSlug:
                  'three-ways-for-co-ordination-in-compound-sentences',
                lessonTitle:
                  'Three ways for co-ordination in compound sentences',
              },
              {
                lessonSlug: 'compound-and-adverbial-complex-sentences-revision',
                lessonTitle:
                  'Compound and adverbial complex sentences revision',
              },
            ],
          },
        },
      },
    })
    .output(unitSchema)
    .input(z.object({ unit: z.string({ description: 'The unit slug' }) }))
    .query(async ({ input, ctx }) => {
      const { res: response } = ctx;
      let { unit: slug } = input;
      const client = getClient();

      timing.start('blockUnitForCopyrightText');
      const blocked = await blockUnitForCopyrightText(client, slug);
      timing.end('blockUnitForCopyrightText');

      if (blocked) {
        response.setHeader('Server-Timing', timing.toHeader(response));
        throw new TRPCError({
          message: 'Unit not available for this query',
          code: 'NOT_FOUND',
        });
      }

      const variantSlug = slug;

      if (/\-\d+$/.test(slug)) {
        slug = slug.replace(/-\d+$/, '');
      }

      // 300 is the max: https://hasura.io/docs/2.0/caching/caching-config/#controlling-cache-lifetime
      const query = gql`
        query getUnit($slug: String!, $variantSlug: String!) @cached(ttl: 300) {
          ${unitCurriculumView}(where: { unitSlug: { _eq: $slug } }) {
            unitSlug
            unitTitle
            unitTags
            unitNotes
            unitDescription
            priorKnowledgeRequirements
            unitNationalCurriculumContent
            priorUnit
            futureUnit
            futureUnitDescription
            priorUnitDescription
            unitLessons
          }

          ${sequenceView}(where: { slug: { _eq: $slug } }) {
            title
            description
            keystage_slug
            lessons
            phase_slug
            subject_slug
            unit_options
            why_this_why_now
            year
          }

          ${unitVariantLessonsView}(
            where: { unit_slug: { _eq: $variantSlug } }
          ) {
            lesson_slug
            lesson_title:lesson_data(path:"title")
            supplementary_data
            optionality:programme_fields(path:"optionality")
            year_slug:programme_fields(path:"year_slug")
            phase_slug:programme_fields(path:"phase_slug")
            subject_slug:programme_fields(path:"subject_slug")
            keystage_slug:programme_fields(path:"keystage_slug")
          }
        }
      `;

      timing.start('getUnit graphql query');
      const res: UnitCurriculumView & UnitVariantLessonsView & SequenceView =
        await client.request(query, { slug, variantSlug });
      timing.end('getUnit graphql query');

      response.setHeader('Server-Timing', timing.toHeader(response));

      if (res[unitCurriculumView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      if (
        res[unitVariantLessonsView].length === 0 &&
        res[sequenceView].length === 0
      ) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message:
            'Unit requested is a parent unit with multiple unit options, please use the unit option slug instead.',
        });
      }

      const root = res[unitCurriculumView][0];
      const orderData = res[unitVariantLessonsView];
      const additionalUnitData = orderData[0];

      const sequenceData = res[sequenceView][0];

      type Metadata = {
        unitTitle: string;
        year: number;
        yearSlug: string;
        phaseSlug: string;
        subjectSlug: string;
        keyStageSlug: string;
        unitLessons: {
          lessonSlug: string;
          lessonTitle: string;
          lessonOrder: number;
        }[];

        // cycle 2
        whyThisWhyNow?: string;
        description?: string;
      };

      // TS: allow me to declare it empty first
      const metadata = {} as Metadata;

      if (additionalUnitData) {
        (metadata.unitTitle = additionalUnitData.optionality
          ? additionalUnitData.optionality
          : root.unitTitle),
          (metadata.yearSlug = additionalUnitData.year_slug);
        metadata.year = parseInt(additionalUnitData?.year_slug.split('-')[1]);
        metadata.phaseSlug = additionalUnitData?.phase_slug;
        metadata.subjectSlug = additionalUnitData?.subject_slug;
        metadata.keyStageSlug = additionalUnitData?.keystage_slug;
        metadata.unitLessons = orderData
          .map((lesson) => ({
            lessonSlug: lesson.lesson_slug,
            lessonTitle: lesson.lesson_title,
            lessonOrder: lesson.supplementary_data?.order_in_unit,
          }))
          .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
      } else if (sequenceData) {
        // FIXME need to test optionality in cycle 2
        metadata.unitTitle = sequenceData.title;
        metadata.description = sequenceData.description;
        metadata.yearSlug = `year-${sequenceData.year}`;
        metadata.year = parseInt(sequenceData.year, 10);
        metadata.phaseSlug = sequenceData.phase_slug;
        metadata.subjectSlug = sequenceData.subject_slug;
        metadata.keyStageSlug = sequenceData.keystage_slug;
        metadata.whyThisWhyNow = sequenceData.why_this_why_now;
        metadata.unitLessons = sequenceData.lessons
          .map((lesson) => ({
            lessonSlug: lesson.slug,
            lessonTitle: lesson.title,
            lessonOrder: lesson.order,
          }))
          .sort((a, b) => (a.lessonOrder || 0) - (b.lessonOrder || 0));
      }

      const reply: UnitSchema = {
        unitSlug: variantSlug,
        // unitOrder: additionalUnitData?.supplementary_data.unit_order,
        tags: (root.unitTags || []).map((tag) => tag.title),
        priorKnowledgeRequirements: root.priorKnowledgeRequirements || [],
        nationalCurriculumContent: (
          root.unitNationalCurriculumContent || []
        ).map((content) => content.title),
        ...metadata,
      };

      return reply;
    }),
});
