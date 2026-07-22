import { expect, test, vi } from 'vitest';
import { LessonRestrictionLevel, lessonRestrictionView } from '@/lib/owaClient';
import { getLessonsRestrictions, isLessonRestricted } from '@/lib/queryGate';
import type { GraphQLClient } from 'graphql-request';

function mockClient(response: unknown): GraphQLClient {
  return {
    request: vi.fn().mockResolvedValue(response),
  } as unknown as GraphQLClient;
}

test('isLessonRestricted blocks lessons with restricted content in any restriction field', async () => {
  const client = mockClient({
    [lessonRestrictionView]: [
      {
        tpc_downloadablefiles_max_restriction:
          LessonRestrictionLevel.OGL_COMPATIBLE,
        tpc_media_max_restriction: LessonRestrictionLevel.OGL_COMPATIBLE,
        tpc_quizimages_max_restriction: LessonRestrictionLevel.OGL_COMPATIBLE,
        tpc_works_max_restriction: LessonRestrictionLevel.RESTRICTED,
      },
    ],
  });

  const result = await isLessonRestricted(client, 'restricted-lesson');

  expect(result.isBlocked()).toBe(true);
  expect(result.reason).toContain('restricted content');
});

test('isLessonRestricted allows lessons with OGL compatible or equivalent restrictions', async () => {
  const client = mockClient({
    [lessonRestrictionView]: [
      {
        tpc_downloadablefiles_max_restriction:
          LessonRestrictionLevel.OGL_EQUIVALENT,
        tpc_media_max_restriction: LessonRestrictionLevel.OGL_COMPATIBLE,
        tpc_quizimages_max_restriction: LessonRestrictionLevel.OGL_COMPATIBLE,
        tpc_works_max_restriction: LessonRestrictionLevel.OGL_COMPATIBLE,
      },
    ],
  });

  const result = await isLessonRestricted(client, 'ogl-equivalent-lesson');

  expect(result.isAllowed()).toBe(true);
});

test('getLessonsRestrictions returns true only for restricted lessons', async () => {
  const client = mockClient({
    [lessonRestrictionView]: [
      {
        slug: 'restricted-lesson',
        tpc_downloadablefiles_max_restriction:
          LessonRestrictionLevel.HIGHLY_RESTRICTED,
      },
      {
        slug: 'allowed-lesson',
        tpc_downloadablefiles_max_restriction:
          LessonRestrictionLevel.OGL_COMPATIBLE,
      },
    ],
  });

  await expect(
    getLessonsRestrictions(client, ['restricted-lesson', 'allowed-lesson']),
  ).resolves.toStrictEqual({
    'restricted-lesson': true,
    'allowed-lesson': false,
  });
});
