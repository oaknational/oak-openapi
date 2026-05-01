import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { TRPCError } from '@trpc/server';
import type { SequenceView } from 'lib/owaClient';
import {
  getClient,
  gql,
  sequenceView,
  sequenceViewWhereInput,
} from 'lib/owaClient';
import { errorResponses } from '@/lib/errorResponses';
import { blockUnitForCopyrightText } from '../../queryGate';

import {
  doesUnitExist,
  formatUnitSummary,
  sortSequencesByProgrammeSpecificity,
  testIfUnitVariant,
} from './helpers';
import {
  unitSummaryRequestOpenAPISchema,
  unitSummaryResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/units';

interface StringEq {
  _eq: string;
}

interface UnitWhere {
  slug: StringEq;
  non_curriculum: { _eq: boolean };
  examboard_slug?: StringEq;
  pathway_slug?: StringEq;
  tier_slug?: StringEq;
}

export const getUnits = router({
  getUnit: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['units', 'unit-and-curriculum-data'],
        path: '/units/{unit}/summary',
        summary: 'Unit summary',
        description:
          'This endpoint returns unit information for a given unit, including slug, title, number of lessons, prior knowledge requirements, national curriculum statements, prior unit details, future unit descriptions, and lesson titles that form the unit',
        errorResponses,
      },
    })
    .input(unitSummaryRequestOpenAPISchema)
    .output(unitSummaryResponseOpenAPISchema)
    .query(async ({ input }) => {
      let { unit: slug } = input;
      const { examBoard, pathway, tier } = input;
      const client = getClient();

      const isUnitVariant = testIfUnitVariant(slug);
      const originalSlug = slug;

      if (isUnitVariant) {
        // we'll get the base unit for variants, then reconstruct later
        slug = slug.replace(/-\d+$/, '');
      }

      const exists = await doesUnitExist(client, slug);

      if (!exists) {
        // there's a nasty bit here where a top level unit can "look like" a unit variant because of the slug structure, so we need to do a quick check to see if the unit exists at all before we do any blocking checks, otherwise we might end up blocking a real 404 which is not ideal from an API consumer perspective

        if (originalSlug === slug) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
        }

        const doubleCheck = await doesUnitExist(client, originalSlug);

        if (!doubleCheck) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
        } else {
          // move the original slug back to the original for the rest of the function
          slug = originalSlug;
        }
      }

      const blocked = await blockUnitForCopyrightText(client, slug);

      if (blocked.isBlocked()) {
        throw new TRPCError({
          message: 'Unit not available for this query (blocked copyright text)',
          code: 'BAD_REQUEST',
          cause: blocked.reason,
        });
      }

      // Ensure that non-curriculum units don't come through. Programme-factor
      // filters are applied at the database layer so the response is already
      // narrowed; the client-side sort below is only a deterministic
      // tiebreaker when multiple rows still match (e.g. shared slug across
      // subject_parent variants).
      const where: UnitWhere = {
        slug: { _eq: slug },
        non_curriculum: { _eq: false },
      };

      if (examBoard) {
        where.examboard_slug = { _eq: examBoard };
      }

      if (pathway) {
        where.pathway_slug = { _eq: pathway };
      }

      if (tier) {
        where.tier_slug = { _eq: tier };
      }

      const query = gql`
        query getUnit($where: ${sequenceViewWhereInput}) @cached(ttl: 300) {
          ${sequenceView}(where: $where) {
            title
            slug
            description
            keystage_slug
            lessons
            notes
            phase_slug
            pathway
            pathway_slug
            subject
            subject_parent
            subject_slug
            tier
            tier_slug
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

      const sequenceData = [...res[sequenceView]].sort(
        sortSequencesByProgrammeSpecificity,
      )[0];

      if (isUnitVariant) {
        // move the unit variant data into the root
        const unitOption = sequenceData.unit_options.find(
          (option) => option.slug === originalSlug,
        );

        if (unitOption) {
          // loop through all the keys in unitOption and copy them to sequenceData
          Object.keys(unitOption).forEach((key) => {
            if (key in sequenceData) {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unsafe-member-access
              (sequenceData as any)[key] =
                unitOption[key as keyof typeof unitOption];
            }
          });
        }
      }

      return formatUnitSummary(originalSlug, sequenceData);
    }),
});
