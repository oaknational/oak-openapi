/*

This is a short term fix to prevent requests to content where we've not completed
the Third Party Content licence data audit. For the time being, we're going to
allow access to the following lessons:

- All of Maths
- more… hopefully (via units or based on links in database related to licence data)

*/

import { gql, GraphQLClient } from 'graphql-request';
import {
  LessonView,
  lessonView,
  SequenceView,
  sequenceView,
  sequenceViewWhereInput,
} from './owaClient';

import { supportedLessons } from './queryGateData/supportedLessons';
import { allowedUnits } from './queryGateData/allowedUnits';

const supportedSubjects = ['maths'];

export const blockedSubjects = ['english'];

type KV = Record<string, string>;

export function modifyQueryWithSubject(query: string, vars: KV) {
  vars.subjectSlug = 'maths';
  if (query.includes('subjectSlug')) {
    return query;
  }

  query += `, _and: { subjectSlug: { _eq: $subject } }`;
  return query;
}

export async function blockLessonForCopyrightText(
  client: GraphQLClient,
  lessonSlug: string,
) {
  const res = await getSubjectAndUnitForLesson(client, lessonSlug);

  if (!res) {
    // unknown subject - block
    return true;
  }

  return isBlockedUnitOrSubject(res);
}

export function isBlockedUnitOrSubject({
  unitSlug,
  subjectSlug,
}: {
  unitSlug: string;
  subjectSlug: string;
}): boolean {
  if (allowedUnits.includes(unitSlug)) {
    // not copyright
    return false;
  }

  if (blockedSubjects.includes(subjectSlug)) {
    return true;
  }

  return false;
}

export async function blockUnitForCopyrightText(
  client: GraphQLClient,
  unitSlug: string,
) {
  // it's possible we're dealing with an unit optional, which always end in a
  // number, so we'll remove that for the moment, and then check

  if (/\-\d+$/.test(unitSlug)) {
    if (allowedUnits.includes(unitSlug.replace(/-\d+$/, ''))) {
      return false;
    }
  }

  if (allowedUnits.includes(unitSlug)) {
    // not copyright
    return false;
  }

  const res = await getSubjectForUnit(client, unitSlug);

  if (!res) {
    // unknown subject - block
    return true;
  }

  const { subjectSlug } = res;

  if (blockedSubjects.includes(subjectSlug)) {
    return true;
  }

  return false;
}

export function modifySubject(subject: string) {
  // this is stupid code, but my thinking is that hopefully we can open up to
  // more subjects quickly
  if (isUnitSupported(subject)) {
    return subject;
  }
  return supportedSubjects[0];
}

export function checkQueryAllowedAssets(
  subject: string = '',
  unit: string = '',
  lesson: string = '',
) {
  return (
    isSubjectSupported(subject) ||
    isUnitSupported(unit) ||
    isLessonSupported(lesson)
  );
}

export async function checkLessonAllowedAsset(
  client: GraphQLClient,
  slug: string,
) {
  const res = await getSubjectAndUnitForLesson(client, slug);

  if (!res) {
    return false;
  }

  const { subjectSlug, unitSlug } = res;

  return (
    isSubjectSupported(subjectSlug) ||
    isUnitSupported(unitSlug) ||
    isLessonSupported(slug)
  );
}

export function supportsImages(subject: string, unit: string) {
  return isSubjectSupported(subject) || isUnitSupported(unit);
}

export function isSubjectSupported(subject: string) {
  return supportedSubjects.includes(subject);
}

export function isUnitSupported(unit: string) {
  return allowedUnits.includes(unit);
}

export function isLessonSupported(lesson: string) {
  return supportedLessons.includes(lesson);
}

export async function getSubjectAndUnitForLesson(
  client: GraphQLClient,
  slug: string,
): Promise<{ subjectSlug: string; unitSlug: string } | false> {
  const query = gql`
  query ($slug: String!) @cached(ttl: 300) {
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

  return { subjectSlug, unitSlug };
}

async function getSubjectForUnit(
  client: GraphQLClient,
  slug: string,
): Promise<{ subjectSlug: string } | false> {
  let where;

  if (/-\d+$/.test(slug)) {
    where = { slug: { _like: `${slug.replace(/-\d+$/, '-')}%` } };
  } else {
    where = { slug: { _eq: slug } };
  }

  const query = gql`
  query ($where: ${sequenceViewWhereInput}) @cached(ttl: 300) {
    ${sequenceView}(
      where: $where
      limit: 1
    ) {
      subject_slug
    }
  }
  `;

  const res: SequenceView = await client.request(query, {
    where,
  });

  if (!res[sequenceView].length) {
    return false;
  }

  const { subject_slug: subjectSlug = '' } = res[sequenceView][0];

  return { subjectSlug };
}
