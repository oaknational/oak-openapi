import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import { SequenceView, getClient, gql, sequenceView } from 'lib/owaClient';
import { z } from 'zod';
import { blockUnitForCopyrightText } from '../queryGate';
import { defaultCaching } from '../networkCache';

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
  notes: z.string().optional(),
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
    .query(async ({ input }) => {
      let { unit: slug } = input;
      const client = getClient();

      const blocked = await blockUnitForCopyrightText(client, slug);

      if (blocked) {
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
        query getUnit($variantSlug: String!) @cached(ttl: 300) {
          ${sequenceView}(where: { slug: { _eq: $variantSlug } }) {
            title
            slug
            description
            keystage_slug
            lessons
            phase_slug
            subject_slug
            unit_options
            why_this_why_now
            year
          }
        }
      `;

      const res: SequenceView = await client.request(query, { variantSlug });
      if (res[sequenceView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      type RootUnitData = {
        unitTitle: string;
        tags: string[];
        notes: string;
        priorKnowledgeRequirements: string[];
        nationalCurriculumContent: string[];
      };

      const sequenceData = res[sequenceView][0];

      // we populate from the sequence view
      const root: RootUnitData = {
        unitTitle: sequenceData.title,
        tags: sequenceData.tags || [],
        notes: sequenceData.notes,
        priorKnowledgeRequirements: (
          sequenceData.prior_knowledge_requirements || []
        ).map(({ title }) => title),
        nationalCurriculumContent: (
          sequenceData.national_curriculum_content || []
        ).map(({ title }) => title),
      };

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

      if (!metadata.whyThisWhyNow) {
        delete metadata.whyThisWhyNow;
      }

      if (sequenceData.unit_options.length > 0) {
        // get the unitTitle from the unit_option who's slug matches the variantSlug
        const unitOption = sequenceData.unit_options.find(
          (unitOption) => unitOption.slug === variantSlug,
        );

        if (unitOption) {
          metadata.unitTitle = unitOption.title;
        }
      }

      const reply: UnitSchema = {
        unitSlug: variantSlug,
        ...root,
        ...metadata,
      };

      return reply;
    }),
});
