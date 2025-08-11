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

// blocked always overrules
import assetBlockedLessons from './queryGateData/assets/blockedLessons.json' with { type: 'json' };
import assetBlockedUnits from './queryGateData/assets/blockedUnits.json' with { type: 'json' };
import supportedUnits from './queryGateData/supportedUnits.json' with { type: 'json' };
import supportedLessons from './queryGateData/supportedLessons.json' with { type: 'json' };

// TODO move these to JSON too
const supportedSubjects = ['maths'];
export const blockedSubjects = ['english', 'financial-education'];

function isLessonBlocked(lessonSlug: string) {
  return (assetBlockedLessons as string[]).includes(lessonSlug);
}

function isUnitBlocked(unitSlug: string) {
  return (assetBlockedUnits as string[]).includes(unitSlug);
}

export async function blockLessonForCopyrightText(
  client: GraphQLClient,
  lessonSlug: string,
) {
  if (supportedLessons.includes(lessonSlug)) {
    // not copyright
    return false;
  }

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
  if (supportedUnits.includes(unitSlug)) {
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
    if (supportedUnits.includes(unitSlug.replace(/-\d+$/, ''))) {
      return false;
    }
  }

  if (supportedUnits.includes(unitSlug)) {
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

export async function checkLessonAllowedAsset(
  client: GraphQLClient,
  lessonSlug: string,
) {
  // if the lesson is blocked, return false
  if (isLessonBlocked(lessonSlug)) {
    return false;
  }

  // otherwise get the subject and unit to see if those are supported
  const res = await getSubjectAndUnitForLesson(client, lessonSlug);

  if (!res) {
    return false;
  }

  const { subjectSlug, unitSlug } = res;

  if (isUnitBlocked(unitSlug)) {
    // blocked unit
    return false;
  }

  return (
    isSubjectSupported(subjectSlug) ||
    isUnitSupported(unitSlug) ||
    supportedLessons.includes(lessonSlug)
  );
}

export function supportsImages(subject: string, unit: string) {
  return isSubjectSupported(subject) || isUnitSupported(unit);
}

export function isSubjectSupported(subject: string) {
  return supportedSubjects.includes(subject);
}

export function isUnitSupported(unit: string) {
  return supportedUnits.includes(unit);
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
