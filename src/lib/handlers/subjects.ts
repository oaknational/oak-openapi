import { protectedProcedure } from '~/lib/protect';
import { router } from '~/lib/trpc';
import { z } from 'zod';
import {
  currentCycle,
  getClient,
  gql,
  SubjectPhase,
  SubjectPhaseView,
  subjectPhaseView,
} from '../owaClient';
import { blockedSubjects } from '../blockedContent';
import { TRPCError } from '@trpc/server';

const input = z.object({
  subject: z.string(),
});

const numberArrayResult = z.array(z.number());
const keyStagesResult = z.array(
  z.object({ keyStageTitle: z.string(), keyStageSlug: z.string() }),
);

const sequenceResult = z.object({
  sequenceSlug: z.string(),
  years: numberArrayResult,
  keyStages: keyStagesResult,
  phaseSlug: z.string(),
  phaseTitle: z.string(),
  ks4Options: z
    .object({
      title: z.string(),
      slug: z.string(),
    })
    .nullable(),
});

type SequenceResult = z.infer<typeof sequenceResult>;

const subjectResult = z.object({
  subjectTitle: z.string(),
  subjectSlug: z.string(),
  sequenceSlugs: z.array(sequenceResult),
  years: numberArrayResult,
  keyStages: keyStagesResult,
});

const subjectsResult = z.array(subjectResult);

function phaseToSequences(subject: SubjectPhase): SequenceResult[] {
  const sequences = subject.phases.reduce(
    (acc: SequenceResult[], { slug, title }) => {
      if (
        slug === 'secondary' &&
        subject.ks4_options &&
        subject.ks4_options.length
      ) {
        const keyStages = phaseToKeyStages(subject).filter((_) =>
          ['ks3', 'ks4'].includes(_.keyStageSlug),
        );
        acc.push(
          ...subject.ks4_options.map((examBoard) => ({
            sequenceSlug: `${subject.slug}-${slug}-${examBoard.slug}`,
            years: yearsFromKeyStages(keyStages),
            keyStages,
            phaseSlug: slug,
            phaseTitle: title,
            ks4Options: examBoard,
          })),
        );
      } else {
        const keyStages = phaseToKeyStages(subject).filter((_) =>
          ['ks1', 'ks2'].includes(_.keyStageSlug),
        );
        acc.push({
          sequenceSlug: `${subject.slug}-${slug}`,
          years: yearsFromKeyStages(keyStages),
          keyStages,
          phaseSlug: slug,
          phaseTitle: title,
          ks4Options: null,
        });
      }

      return acc;
    },
    [] as SequenceResult[],
  );

  return sequences;
}

function phaseToKeyStages(subject: SubjectPhase) {
  return subject.keystages.map(({ slug, title }) => {
    return { keyStageSlug: slug, keyStageTitle: title };
  });
}

function yearsFromKeyStages(
  keyStages: { keyStageSlug: string; keyStageTitle: string }[],
) {
  const years = keyStages.reduce((acc: number[], { keyStageSlug }) => {
    switch (keyStageSlug) {
      case 'ks1':
        acc.push(1, 2);
        break;
      case 'ks2':
        acc.push(3, 4, 5, 6);
        break;
      case 'ks3':
        acc.push(7, 8, 9);
        break;
      case 'ks4':
        acc.push(10, 11);
        break;
    }
    return acc;
  }, []);

  // RS we don't support this yet, because there's no endpoint to consume the value
  // if (years.length === 11) {
  //   years.push('all-years');
  // }

  return years;
}

async function getSubjectPhase(subject: string): Promise<SubjectPhase> {
  if (blockedSubjects.includes(subject)) {
    throw new TRPCError({
      message: 'Subject not available',
      code: 'NOT_FOUND',
    });
  }

  const client = getClient();
  const query = gql`
  query ($subject: String!, $currentCycle: String!) @cached(ttl: 300) {
    ${subjectPhaseView}(
      where: {
        cycle: { _eq: $currentCycle }
        slug: { _eq: $subject }
      }
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
    subject,
  });

  if (!res || !Array.isArray(res[subjectPhaseView])) {
    throw new TRPCError({
      message: 'Subject not found',
      code: 'NOT_FOUND',
    });
  }

  if (res[subjectPhaseView].length !== 1) {
    throw new TRPCError({
      message: `There was a problem requesting ${subject}, more than one result was returned`,
      code: 'INTERNAL_SERVER_ERROR',
    });
  }

  return res[subjectPhaseView][0];
}

export const getSubjects = router({
  getAllSubjects: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects',
        description:
          'This endpoint returns an array of all subjects and associated sequences, key stages and years that are currently available on Oak',
        example: {
          response: [
            {
              subjectTitle: 'Design and technology',
              subjectSlug: 'design-technology',
              sequenceSlugs: [
                'design-technology-primary',
                'design-technology-secondary',
              ],
              years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
              keyStages: [
                {
                  keyStageSlug: 'ks1',
                  keyStageTitle: 'Key Stage 1',
                },
                {
                  keyStageSlug: 'ks2',
                  keyStageTitle: 'Key Stage 2',
                },
                {
                  keyStageSlug: 'ks3',
                  keyStageTitle: 'Key Stage 3',
                },
                {
                  keyStageSlug: 'ks4',
                  keyStageTitle: 'Key Stage 4',
                },
              ],
            },
          ],
        },
      },
    })
    .input(z.void())
    .output(subjectsResult)
    .query(async () => {
      const client = getClient();
      const query = gql`
      query ($blocked: [String!]!, $currentCycle: String!) @cached(ttl: 300) {
        ${subjectPhaseView}(
          where: {
            cycle: { _eq: $currentCycle }
            slug: { _nin: $blocked }
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
        blocked: blockedSubjects,
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
        description:
          'This endpoint returns a single subject and associated sequences, key stages and years.',
        example: {
          response: {
            subjectTitle: 'Design and technology',
            subjectSlug: 'design-technology',
            sequenceSlugs: [
              'design-technology-primary',
              'design-technology-secondary',
            ],
            years: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11],
            keyStages: [
              {
                keyStageSlug: 'ks1',
                keyStageTitle: 'Key Stage 1',
              },
              {
                keyStageSlug: 'ks2',
                keyStageTitle: 'Key Stage 2',
              },
              {
                keyStageSlug: 'ks3',
                keyStageTitle: 'Key Stage 3',
              },
              {
                keyStageSlug: 'ks4',
                keyStageTitle: 'Key Stage 4',
              },
            ],
          },
        },
      },
    })
    .input(input)
    .output(subjectResult)
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
        tags: ['lists'],
        method: 'GET',
        path: '/subjects/{subject}/sequences',
      },
    })
    .input(
      z.object({
        subject: z.string(),
      }),
    )
    .output(z.array(sequenceResult))
    .query(async ({ input }) => {
      return phaseToSequences(await getSubjectPhase(input.subject));
    }),
  getSubjectKeyStages: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects/{subject}/key-stages',
      },
    })
    .input(input)
    .output(keyStagesResult)
    .query(async ({ input }) => {
      return phaseToKeyStages(await getSubjectPhase(input.subject));
    }),
  getSubjectYears: protectedProcedure
    .meta({
      openapi: {
        tags: ['lists'],
        method: 'GET',
        path: '/subjects/{subject}/years',
      },
    })
    .input(input)
    .output(numberArrayResult)
    .query(async ({ input }) => {
      return yearsFromKeyStages(
        phaseToKeyStages(await getSubjectPhase(input.subject)),
      );
    }),
});
