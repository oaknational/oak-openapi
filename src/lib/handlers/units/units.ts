import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  SequenceView,
  getClient,
  gql,
  sequenceView,
  sequenceViewWhereInput,
} from 'lib/owaClient';

import { blockUnitForCopyrightText } from '../../queryGate';

import { formatUnitSummary, testIfUnitVariant } from './helpers';
import {
  unitSummaryRequestOpenAPISchema,
  unitSummaryResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/units';

export const getUnits = router({
  getUnit: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['units'],
        path: '/units/{unit}/summary',
        description:
          'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
        errorResponses: [],
      },
    })
    .input(unitSummaryRequestOpenAPISchema)
    .output(unitSummaryResponseOpenAPISchema)
    .query(async ({ input }) => {
      const { unit: slug } = input;
      const client = getClient();

      const blocked = await blockUnitForCopyrightText(client, slug);

      if (blocked) {
        throw new TRPCError({
          message: 'Unit not available for this query (blocked copyright text)',
          code: 'NOT_FOUND',
        });
      }

      const isUnitVariant = testIfUnitVariant(slug);

      // Ensure that non-curriculum units don't come through
      const whereNonCurriculum = { non_curriculum: { _eq: false } };

      let whereSlug;

      if (isUnitVariant) {
        whereSlug = { slug: { _like: `${slug.replace(/-\d+$/, '-')}%` } };
      } else {
        whereSlug = { slug: { _eq: slug } };
      }

      const where = { ...whereSlug, ...whereNonCurriculum };

      const query = gql`
        query getUnit($where: ${sequenceViewWhereInput}) @cached(ttl: 300) {
          ${sequenceView}(where: $where) {
            title
            slug
            description
            keystage_slug
            lessons
            phase_slug
            subject_slug
            unit_options
            why_this_why_now
            threads
            year
            examboard
            examboard_slug
            subjectcategories

            prior_knowledge_requirements
            national_curriculum_content
          }
        }
      `;

      const res: SequenceView = await client.request(query, { where });
      if (res[sequenceView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      const sequenceData = res[sequenceView][0];

      return formatUnitSummary(slug, sequenceData);
    }),
});
