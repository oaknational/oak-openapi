/*

This is a short term fix to prevent requests to content where we've not completed
the Third Party Content licence data audit. For the time being, we're going to
allow access to the following lessons:

- All of Maths
- more… hopefully (via units or based on links in database related to licence data)

*/

import { gql, GraphQLClient } from 'graphql-request';
import { LessonView, lessonView } from './owaClient';

const supportedSubjects = ['maths'];
const supportedUnits = ['victorian-childhood-non-fiction-reading-and-writing'];

type KV = Record<string, string>;

/**
 *
 * @param query graphql string query
 * @param vars reference to the variables
 * @returns {string} modified query
 */
export function modifyQueryWithSubject(query: string, vars: KV) {
  vars.subjectSlug = 'maths';
  if (query.includes('subjectSlug')) {
    return query;
  }

  query += `, _and: { subjectSlug: { _eq: $subject } }`;
  return query;
}

export function modifySubject(subject: string) {
  // this is stupid code, but my thinking is that hopefully we can open up to
  // more subjects quickly
  if (supportedSubjects.includes(subject)) {
    return subject;
  }
  return supportedSubjects[0];
}

export async function checkLesson(client: GraphQLClient, slug: string) {
  const query = gql`
  query ($slug: String!) {
    ${lessonView}(
      where: { lessonSlug: { _eq: $slug }, isLegacy: { _eq: false } }
    ) {
      subjectSlug
      unitSlug
    }
  }
  `;

  const res: LessonView = await client.request(query, {
    slug,
  });

  if (!res[lessonView].length) {
    return false;
  }

  const { subjectSlug = '', unitSlug = '' } = res[lessonView][0];

  return (
    supportedSubjects.includes(subjectSlug) || supportedUnits.includes(unitSlug)
  );
}
