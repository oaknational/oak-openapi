import { protectedProcedure } from '@/lib/protect';
import { router } from '@/lib/trpc';
import { z } from 'zod';
import {
  currentCycle,
  getClient,
  gql,
  SubjectPhaseView,
  subjectPhaseView,
} from '../../owaClient';
import { TRPCError } from '@trpc/server';
import {
  getSubjectPhase,
  phaseToKeyStages,
  phaseToSequences,
  yearsFromKeyStages,
} from './helpers';
import { inputSchema, numberArrayResult } from './types';
import {
  allSubjectsResponseOpenAPISchema,
  subjectKeyStagesRequestOpenAPISchema,
  subjectKeyStagesResponseOpenAPISchema,
  subjectRequestOpenAPISchema,
  subjectResponseOpenAPISchema,
  subjectSequenceRequestOpenAPISchema,
  subjectSequenceResponseOpenAPISchema,
} from '@/lib/zod-openapi/generated/subjects';

export const getSubjects = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        description:
          'This endpoint returns an array of all subjects and associated sequences, key stages and years that are currently available on Oak',
        errorResponses: [],
      },
    })
    .input(z.void())
    .output(allSubjectsResponseOpenAPISchema)
    .query(async () => {
      const client = getClient();
      // slug: { _nin: $blocked }
      // filtering out financial education - this will be replaced once RHSE units are published
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

      const reply = res[subjectPhaseView].map((subject) => {
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
        path: '/subjects/{subject}',
        errorResponses: [],
        description:
          'This endpoint returns a single subject and associated sequences, key stages and years.',
      },
    })
    .input(subjectRequestOpenAPISchema)
    .output(subjectResponseOpenAPISchema)
    .query(async ({ input }) => {
      const subject = await getSubjectPhase(input.subject);

      const keyStages = phaseToKeyStages(subject);
      return {
        subjectTitle: subject.title,
        subjectSlug: subject.slug,
        sequenceSlugs: phaseToSequences(subject),
        keyStages,
        years: yearsFromKeyStages(keyStages),
      };
    }),
  getSubjectSequence: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists', 'sequences'],
        method: 'GET',
        path: '/subjects/{subject}/sequences',
        errorResponses: [],
        description:
          'List of the sequences, including phase, key stage 4 options, years and key stages the sequence applies to for a subject.',
      },
    })
    .input(subjectSequenceRequestOpenAPISchema)
    .output(subjectSequenceResponseOpenAPISchema)
    .query(async ({ input }) => {
      return phaseToSequences(await getSubjectPhase(input.subject));
    }),
  getSubjectKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects/{subject}/key-stages',
        errorResponses: [],
        description: 'List of the key stages a subject is taught in.',
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
        path: '/subjects/{subject}/years',
        errorResponses: [],
        description: 'List of the years a subject is taught in.',
      },
    })
    // TODO: put these examples in their own file
    .input(inputSchema.openapi({ example: { subject: 'art' } }))
    .output(
      numberArrayResult.openapi({
        example: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
      }),
    )
    .query(async ({ input }) => {
      return yearsFromKeyStages(
        phaseToKeyStages(await getSubjectPhase(input.subject)),
      );
    }),
});
