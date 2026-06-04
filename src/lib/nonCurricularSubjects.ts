import type { GraphQLClient } from 'graphql-request';
import { TRPCError } from '@trpc/server';
import { gql, sequenceView } from './owaClient';

/**
 * Throws NOT_FOUND if the given subject slug is flagged as non-curriculum in
 * the sequence view.  Call this early in any handler that accepts a free-text
 * subject slug so that non-curriculum subjects are consistently excluded.
 */
export async function assertSubjectIsCurricular(
  subject: string,
  client: GraphQLClient,
): Promise<void> {
  const query = gql`
    query ($subject: String!) @cached(ttl: 300) {
      ${sequenceView}(
        where: { subject_slug: { _eq: $subject } }
        limit: 1
      ) {
        non_curriculum
      }
    }
  `;

  const res: Record<string, { non_curriculum: boolean }[]> =
    await client.request(query, { subject });

  if (res[sequenceView]?.[0]?.non_curriculum === true) {
    throw new TRPCError({
      message: `The "${subject}" subject is not part of the curriculum and cannot be accessed via this API.`,
      code: 'BAD_REQUEST',
    });
  }
}

/**
 * Returns the set of subject slugs that are flagged as non-curriculum.
 * Intended for filtering list endpoints where checking each slug individually
 * would be wasteful.
 */
export async function getNonCurricularSubjectSlugs(
  client: GraphQLClient,
): Promise<Set<string>> {
  const query = gql`
    query @cached(ttl: 300) {
      ${sequenceView}(
        where: { non_curriculum: { _eq: true } }
      ) {
        subject_slug
      }
    }
  `;

  const res: Record<string, { subject_slug: string }[]> =
    await client.request(query);

  return new Set((res[sequenceView] ?? []).map((r) => r.subject_slug));
}
