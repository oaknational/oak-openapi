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
import type { LessonRestrictionView, LessonView } from './owaClient';
import {
  LessonRestrictionLevel,
  lessonRestrictionView,
  lessonView,
} from './owaClient';

// blocked always overrules
// import assetBlockedUnits from './queryGateData/assets/blockedUnits.json' with { type: 'json' };
import supportedUnits from './queryGateData/copyright/supportedUnits.json' with { type: 'json' };

const commonError =
  'Learn more about Oak errors: https://open-api.thenational.academy/docs/about-oaks-api/errors';

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

export function isRestricted(
  restriction: LessonRestrictionLevel | undefined,
): boolean {
  return (
    restriction === LessonRestrictionLevel.RESTRICTED ||
    restriction === LessonRestrictionLevel.HIGHLY_RESTRICTED
  );
}

export const blockedSubjects = ['financial-education'];

export async function blockLessonForCopyrightText(
  client: GraphQLClient,
  lessonSlug: string,
): Promise<GateWithReason> {
  const query = gql`
  query ($slug: String!) {
    ${lessonRestrictionView}(
      where: { slug: { _eq: $slug } }
    ) {
      tpc_downloadablefiles_max_restriction
      tpc_media_max_restriction
      tpc_quizimages_max_restriction
      tpc_works_max_restriction
    }
  }
  `;

  const res: LessonRestrictionView = await client.request(query, {
    slug: lessonSlug,
  });

  if (!res[lessonRestrictionView].length) {
    return new GateWithReason(false, 'Lesson not in restrictions');
  }

  const restriction = res[lessonRestrictionView][0];

  if (isRestricted(restriction.tpc_works_max_restriction)) {
    return new GateWithReason(
      true,
      'Lesson contains copyright text and therefore blocked. ' + commonError,
    );
  }

  return new GateWithReason(false, 'Lesson does not contain copyright text');
}

export function isBlockedUnitOrSubject({
  subjectSlug,
}: {
  subjectSlug: string;
}): GateWithReason {
  if (blockedSubjects.includes(subjectSlug)) {
    return new GateWithReason(
      true,
      'Subject is copyright protected and therefore blocked',
    );
  }

  return new GateWithReason(false, 'Unit and subject are supported');
}

interface CheckLessonWithSubject {
  lessonSlug: string;
  subjectSlug: string;
  unitSlug: string;
  client: GraphQLClient;
}

interface CheckLessonWithoutSubject {
  lessonSlug: string;
  client: GraphQLClient;
}

export async function checkLessonAllowedAsset(
  args: CheckLessonWithSubject | CheckLessonWithoutSubject,
): Promise<GateWithReason> {
  const { lessonSlug, client } = args;

  const query = gql`
  query ($slug: String!) @cached(ttl: 300) {
    ${lessonRestrictionView}(
      where: { slug: { _eq: $slug } }
    ) {
      tpc_downloadablefiles_max_restriction
      tpc_media_max_restriction
    }
  }
  `;

  const res: LessonRestrictionView = await client.request(query, {
    slug: lessonSlug,
  });

  if (!res[lessonRestrictionView].length) {
    return new GateWithReason(false, 'Lesson not in restrictions');
  }

  const restriction = res[lessonRestrictionView][0];

  if (
    isRestricted(restriction.tpc_downloadablefiles_max_restriction) ||
    isRestricted(restriction.tpc_media_max_restriction)
  ) {
    return new GateWithReason(
      true,
      'Lesson contains copyright assets and therefore blocked. ' + commonError,
    );
  }

  return new GateWithReason(false, `Lesson (${lessonSlug}) is supported`);
}

export async function checkLessonAllowedQuiz(
  client: GraphQLClient,
  lessonSlug: string,
): Promise<GateWithReason> {
  const query = gql`
  query ($slug: String!) @cached(ttl: 300) {
    ${lessonRestrictionView}(
      where: { slug: { _eq: $slug } }
    ) {
      tpc_quizimages_max_restriction
    }
  }
  `;

  const res: LessonRestrictionView = await client.request(query, {
    slug: lessonSlug,
  });

  if (!res[lessonRestrictionView].length) {
    return new GateWithReason(false, 'Lesson not in restrictions');
  }

  const restriction = res[lessonRestrictionView][0];

  if (isRestricted(restriction.tpc_quizimages_max_restriction)) {
    return new GateWithReason(
      true,
      'Lesson contains copyright quiz images and therefore blocked. ' +
        commonError,
    );
  }

  return new GateWithReason(false, 'Lesson quiz is not blocked');
}

export function isSubjectSupported(subject: string): GateWithReason {
  return new GateWithReason(false, `Subject '${subject}' is supported`);
}

export function isUnitSupported(unit: string): GateWithReason {
  const blocked = !supportedUnits.includes(unit);
  return new GateWithReason(
    blocked,
    blocked ? `Unit '${unit}' is not supported` : `Unit '${unit}' is supported`,
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
