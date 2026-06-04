import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import * as z from 'zod/v4';
import { subjectSlugs } from '@/lib/keyStageAndSubjects';
import {
  getSubjectFromProgrammes,
  getSubjectPhase,
  phaseToKeyStages,
  yearsFromKeyStages,
} from './helpers';
import { getNonCurricularSubjectSlugs } from '@/lib/nonCurricularSubjects';
import { errorResponses } from '@/lib/errorResponses';
import {
  allSubjectsResponseOpenAPISchema,
  subjectKeyStagesRequestOpenAPISchema,
  subjectKeyStagesResponseOpenAPISchema,
  subjectRequestOpenAPISchema,
  subjectResponseOpenAPISchema,
  subjectYearsRequestOpenAPISchema,
  subjectYearsResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/subjects';

export const getSubjects = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        summary: 'Subjects',
        description:
          'This endpoint returns an array of available subject slugs.',
        errorResponses,
      },
    })
    .input(z.void())
    .output(allSubjectsResponseOpenAPISchema)
    .query(async () => {
      const client = getClient();
      // filtering out financial education
      const query = gql`
      query ($currentCycle: String!) @cached(ttl: 300) {
        ${subjectPhaseView}(
          where: {
            cycle: { _eq: $currentCycle }
            _not: {slug: {_eq: "financial-education"}}
          }
          order_by: { display_order: asc }
        ) {
          title
          slug
          keystages
          phases
          ks4_options
          display_order
        }
      }`;

      const res: SubjectPhaseView = await client.request(query, {
        currentCycle,
      });

      if (
        !res ||
        !Array.isArray(res[subjectPhaseView]) ||
        res[subjectPhaseView].length === 0
      ) {
        throw new TRPCError({
          message: `There was a problem requesting the subjects and associated data`,
          code: 'INTERNAL_SERVER_ERROR',
        });
      }

      const nonCurricular = await getNonCurricularSubjectSlugs(client);

      const reply = res[subjectPhaseView]
        .filter((subject) => !nonCurricular.has(subject.slug))
        .map((subject) => {
          const keyStages = phaseToKeyStages(subject);
          return {
            subjectTitle: subject.title,
            subjectSlug: subject.slug,
            sequenceSlugs: phaseToSequences(subject),
            keyStages,
            years: yearsFromKeyStages(keyStages),
          };
        });

      return reply;
    }),
  getSubject: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Subject',
        path: '/subjects/{subject}',
        errorResponses,
        description:
          'This endpoint returns the sequences, key stages and years that are currently available for a given subject.',
      },
    })
    .input(subjectRequestOpenAPISchema)
    .output(subjectResponseOpenAPISchema)
    .query(({ input }) => {
      return getSubjectFromProgrammes(input.subject);
    }),
  getSubjectKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Key stages within a subject',
        path: '/subjects/{subject}/key-stages',
        errorResponses,
        description:
          'This endpoint returns a list of key stages that are currently available for a given subject.',
      },
    })
    .input(subjectKeyStagesRequestOpenAPISchema)
    .output(subjectKeyStagesResponseOpenAPISchema)
    .query(async ({ input }) => {
      return phaseToKeyStages(await getSubjectPhase(input.subject));
    }),
  getSubjectYears: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        summary: 'Year groups for a given subject',
        path: '/subjects/{subject}/years',
        errorResponses,
        description:
          'This endpoint returns an array of years that are currently available for a given subject.',
      },
    })
    // TODO: put these examples in their own file
    .input(subjectYearsRequestOpenAPISchema)
    .output(subjectYearsResponseOpenAPISchema)
    .query(async ({ input }) => {
      return yearsFromKeyStages(
        phaseToKeyStages(await getSubjectPhase(input.subject)),
      );
    }),
});
