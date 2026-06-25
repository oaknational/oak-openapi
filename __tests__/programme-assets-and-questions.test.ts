import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lessonView, unitVariantLessonsView } from '@/lib/owaClient';

const mocks = vi.hoisted(() => ({
  owaClientRequestMock: vi.fn(),
}));

vi.mock('@/lib/owaClient', async () => {
  const actual = await vi.importActual('@/lib/owaClient');
  return {
    ...actual,
    getClient: () => ({
      request: mocks.owaClientRequestMock,
    }),
  };
});

describe('programme assets and questions endpoints', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('/subjects/{subject}/programmes/{programme}/assets returns [] when no lessons are found in programme', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAssets.getProgrammeAssets({
        subject: 'computing',
        programme: 'computing-secondary-year-7',
      }),
    ).resolves.toStrictEqual([]);

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${unitVariantLessonsView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[1]).toEqual({
      programme: 'computing-secondary-year-7',
    });
  });

  it('/subjects/{subject}/programmes/{programme}/questions returns [] when no lessons are found in programme', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getQuestions.getQuestionsForProgramme({
        subject: 'computing',
        programme: 'computing-secondary-year-7',
        offset: 0,
        limit: 10,
      }),
    ).resolves.toStrictEqual([]);

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${unitVariantLessonsView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[1]).toEqual({
      programme: 'computing-secondary-year-7',
    });
  });

  it('/subjects/{subject}/programmes/{programme}/questions queries lessonView for programme lesson slugs', async () => {
    mocks.owaClientRequestMock.mockResolvedValueOnce({
      [unitVariantLessonsView]: [
        {
          lesson_slug: 'variables-and-data-types',
          unit_slug: 'variables',
        },
      ],
    });
    mocks.owaClientRequestMock.mockResolvedValueOnce({
      [lessonView]: [],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getQuestions.getQuestionsForProgramme({
        subject: 'computing',
        programme: 'computing-secondary-year-7',
        offset: 0,
        limit: 10,
      }),
    ).resolves.toStrictEqual([]);

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(2);
    expect(mocks.owaClientRequestMock.mock.calls[1]?.[0]).toContain(
      `${lessonView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[1]?.[1]).toEqual({
      lessonSlugs: ['variables-and-data-types'],
      offset: 0,
      limit: 10,
    });
  });
});
