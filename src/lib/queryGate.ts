/*

This is a short term fix to prevent requests to content where we've not completed
the Third Party Content licence data audit. For the time being, we're going to
allow access to the following lessons:

- All of Maths
- more… hopefully (via units or based on links in database related to licence data)

– Oct 18, 2024 ("Short term")

*/

import { gql } from 'graphql-request';
import type { GraphQLClient } from 'graphql-request';
import type { LessonView, SequenceView } from './owaClient';
import { lessonView, sequenceView, sequenceViewWhereInput } from './owaClient';

// blocked always overrules
import assetBlockedLessons from './queryGateData/assets/blockedLessons.json' with { type: 'json' };
import assetBlockedUnits from './queryGateData/assets/blockedUnits.json' with { type: 'json' };
import supportedUnits from './queryGateData/copyright/supportedUnits.json' with { type: 'json' };
import supportedLessons from './queryGateData/copyright/supportedLessons.json' with { type: 'json' };
import { blockedSequenceSubjects } from './blockedContent';

// Custom result class that requires explicit narrowing via type guards
class GateWithReason {
  readonly blocked: boolean;
  readonly reason: string;

  constructor(blocked: boolean, reason = '') {
    this.blocked = blocked;
    this.reason = reason;
  }

  toString() {
    return this.reason || String(this.blocked);
  }

  isAllowed(): this is GateWithReason & { blocked: false } {
    return this.blocked === false;
  }

  isBlocked(): this is GateWithReason & { blocked: true } {
    return this.blocked === true;
  }
}

const supportedSubjects = ['maths'];
export const blockedSubjects = ['english', 'financial-education'];

function isLessonBlocked(lessonSlug: string): boolean {
  return assetBlockedLessons.includes(lessonSlug);
}

function isUnitBlocked(unitSlug: string): boolean {
  return assetBlockedUnits.includes(unitSlug);
}

export function isSequenceSubjectBlocked(subjectSlug: string): GateWithReason {
  if (blockedSequenceSubjects.includes(subjectSlug)) {
    return new GateWithReason(true, `Subject '${subjectSlug}' is blocked`);
  }

  return new GateWithReason(false, `Subject '${subjectSlug}' is not blocked`);
}

export async function blockLessonForCopyrightText(
  client: GraphQLClient,
  lessonSlug: string,
): Promise<GateWithReason> {
  if (supportedLessons.includes(lessonSlug)) {
    // not copyright
    return new GateWithReason(false, 'Lesson is in supported content');
  }

  const res = await getSubjectAndUnitForLesson(client, lessonSlug);

  if (!res) {
    // unknown subject - block
    return new GateWithReason(true, 'Unknown subject');
  }

  return isBlockedUnitOrSubject(res);
}

export function isBlockedUnitOrSubject({
  unitSlug,
  subjectSlug,
}: {
  unitSlug: string;
  subjectSlug: string;
}): GateWithReason {
  if (supportedUnits.includes(unitSlug)) {
    // not copyright
    return new GateWithReason(false, 'Unit is in supported content');
  }

  if (blockedSubjects.includes(subjectSlug)) {
    return new GateWithReason(
      true,
      'Subject is copyright protected and therefore blocked',
    );
  }

  return new GateWithReason(false, 'Unit and subject are supported');
}

export async function blockUnitForCopyrightText(
  client: GraphQLClient,
  unitSlug: string,
): Promise<GateWithReason> {
  // it's possible we're dealing with an unit optional, which always end in a
  // number, so we'll remove that for the moment, and then check

  if (/-\d+$/.test(unitSlug)) {
    if (supportedUnits.includes(unitSlug.replace(/-\d+$/, ''))) {
      return new GateWithReason(false, 'Unit base is in supported content');
    }
  }

  if (supportedUnits.includes(unitSlug)) {
    // not copyright
    return new GateWithReason(false, 'Unit is in supported content');
  }

  const res = await getSubjectForUnit(client, unitSlug);

  if (!res) {
    // unknown subject - block
    return new GateWithReason(true, 'Unknown subject for given lesson');
  }

  const { subjectSlug } = res;

  if (blockedSubjects.includes(subjectSlug)) {
    return new GateWithReason(
      true,
      'Subject is copyright protected and therefore blocked',
    );
  }

  return new GateWithReason(false, 'Unit and subject are supported');
}

export async function checkLessonAllowedAsset(
  client: GraphQLClient,
  lessonSlug: string,
  lessonOnly = false,
): Promise<GateWithReason> {
  // if the lesson is blocked, return false
  if (isLessonBlocked(lessonSlug)) {
    return new GateWithReason(
      true,
      'Lesson asset is restricted and therefore blocked',
    );
  }

  if (lessonOnly) {
    return new GateWithReason(
      false,
      'Lesson is not blocked, skipping subject and unit checks',
    );
  }

  // otherwise get the subject and unit to see if those are supported
  const res = await getSubjectAndUnitForLesson(client, lessonSlug);

  if (!res) {
    return new GateWithReason(true, 'Subject and unit not found');
  }

  const { subjectSlug, unitSlug } = res;

  if (isUnitBlocked(unitSlug)) {
    // blocked unit
    return new GateWithReason(true, 'Unit is restricted and therefore blocked');
  }

  if (isSubjectSupported(subjectSlug).isAllowed()) {
    return new GateWithReason(false, `Subject (${subjectSlug}) is supported`);
  }

  if (isUnitSupported(unitSlug).isAllowed()) {
    return new GateWithReason(false, `Unit (${unitSlug}) is supported`);
  }

  if (isLessonSupported(lessonSlug).isAllowed()) {
    return new GateWithReason(false, `Lesson (${lessonSlug}) is supported`);
  }

  return new GateWithReason(
    true,
    `Lesson (${lessonSlug}) is restricted and not available, and subject (${subjectSlug}) and unit (${unitSlug}) are blocked for assets`,
  );
}

export function supportsImages(subject: string, unit: string): GateWithReason {
  const subjectSupported = isSubjectSupported(subject);
  const unitSupported = isUnitSupported(unit);

  if (subjectSupported.isBlocked()) {
    return new GateWithReason(true, 'Subject supports images');
  }

  if (unitSupported.isBlocked()) {
    return new GateWithReason(true, 'Unit supports images');
  }

  return new GateWithReason(false, 'Neither subject nor unit support images');
}

export function isSubjectSupported(subject: string): GateWithReason {
  const blocked = !supportedSubjects.includes(subject);
  return new GateWithReason(
    blocked,
    blocked
      ? `Subject '${subject}' is not supported`
      : `Subject '${subject}' is supported`,
  );
}

export function isUnitSupported(unit: string): GateWithReason {
  const blocked = !supportedUnits.includes(unit);
  return new GateWithReason(
    blocked,
    blocked ? `Unit '${unit}' is not supported` : `Unit '${unit}' is supported`,
  );
}

export function isLessonSupported(lesson: string): GateWithReason {
  const blocked = !supportedLessons.includes(lesson);
  return new GateWithReason(
    blocked,
    blocked
      ? `Lesson '${lesson}' is not supported`
      : `Lesson '${lesson}' is supported`,
  );
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
