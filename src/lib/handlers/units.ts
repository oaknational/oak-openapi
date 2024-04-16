import { protectedProcedure } from '~/lib/auth';
import { router } from '~/lib/trpc';
import { TRPCError } from '@trpc/server';
import {
  UnitCurriculumView,
  getClient,
  gql,
  unitCurriculumView,
} from 'lib/owaClient';
import { z } from 'zod';

export const unitSchema = z.object({
  slug: z.string(),
  title: z.string(),
  tags: z.array(z.string()),
  // notes: z.string(),
  // description: z.string(),
  plannedNumberOfLessons: z.number(),
  priorKnowledgeRequirements: z.array(z.string()),
  nationalCurriculumContent: z.array(z.string()),
  priorUnits: z.object({
    description: z.string(),
    units: z.array(z.object({ slug: z.string(), title: z.string() })),
  }),
  futureUnits: z.object({
    description: z.string(),
    units: z.array(z.object({ slug: z.string(), title: z.string() })),
  }),
});

export const getUnits = router({
  getUnit: protectedProcedure
    .meta({
      openapi: {
        method: 'GET',
        tags: ['units'],
        path: '/units/{slug}/summary',
        description:
          'Get prior knowledge requirements, national curriculum content, tags, prior and next units to learn for the specified unit',
      },
    })
    .output(unitSchema)
    .input(z.object({ slug: z.string() }))
    .query(async ({ input }) => {
      const { slug } = input;
      const client = getClient();

      const query = gql`
        query getUnit($slug: String!) {
          ${unitCurriculumView}(where: { unitSlug: { _eq: $slug } }) {
            unitSlug
            unitTitle
            unitTags
            unitNotes
            unitDescription
            plannedNumberOfLessons
            priorKnowledgeRequirements
            unitNationalCurriculumContent
            priorUnits
            futureUnits
            connectionFutureUnitDescription
            connectionPriorUnitDescription
          }
        }
      `;

      const res: UnitCurriculumView = await client.request(query, { slug });

      if (res[unitCurriculumView].length === 0) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Unit not found' });
      }

      // transform the data to clean up objects to arrays
      //   slug, title, tags: .tags | map(.title), notes, description, plannedNumberOfLessons, priorKnowledgeRequirements, nationalCurriculumContent: .nationalCurriculumContent | map(.title), priorUnits: { description: .priorUnitDescription, units: .priorUnits | map({ slug, title }) }, futureUnits: { description: .futureUnitsDescription, units: .futureUnits | map({ slug, title }) }
      // }

      const root = res[unitCurriculumView][0];

      return {
        slug: root.unitSlug,
        title: root.unitTitle,
        tags: root.unitTags.map((tag) => tag.title),
        plannedNumberOfLessons: root.plannedNumberOfLessons,
        priorKnowledgeRequirements: root.priorKnowledgeRequirements,
        nationalCurriculumContent: root.unitNationalCurriculumContent.map(
          (content) => content.title
        ),
        priorUnits: {
          description: root.connectionPriorUnitDescription || '',
          units: root.priorUnits.map((unit) => ({
            slug: unit.slug,
            title: unit.title,
          })),
        },
        futureUnits: {
          description: root.connectionFutureUnitDescription || '',
          units: root.futureUnits.map((unit) => ({
            slug: unit.slug,
            title: unit.title,
          })),
        },
      };
    }),
});
