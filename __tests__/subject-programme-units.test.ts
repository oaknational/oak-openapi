import { beforeEach, describe, expect, it, vi } from 'vitest';
import { unitVariantLessonsView } from '@/lib/owaClient';

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

function makeRow(overrides: {
  unit_slug: string;
  unit_title: string;
  unit_order: number;
  optionality?: string;
  subject_slug?: string;
}) {
  return {
    unit_slug: overrides.unit_slug,
    unit_title: overrides.unit_title,
    optionality: overrides.optionality ?? null,
    subject_slug: overrides.subject_slug ?? 'computing',
    supplementary_data: {
      unit_order: overrides.unit_order,
      order_in_unit: 1,
    },
  };
}

function makeKeyStageSubjectRow(overrides: {
  unit_slug: string;
  unit_title: string;
  year_slug: string;
  optionality?: string;
  examboard_slug?: string | null;
  examboard_title?: string | null;
}) {
  return {
    unit_slug: overrides.unit_slug,
    unit_title: overrides.unit_title,
    year_slug: overrides.year_slug,
    optionality: overrides.optionality ?? null,
    examboard_slug: overrides.examboard_slug ?? null,
    examboard_title: overrides.examboard_title ?? null,
  };
}

describe('/programmes/{programme}/units', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('returns units ordered by unit_order', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [
        makeRow({
          unit_slug: 'algorithms',
          unit_title: 'Algorithms',
          unit_order: 2,
        }),
        // second lesson row for the same unit — should be deduped
        makeRow({
          unit_slug: 'algorithms',
          unit_title: 'Algorithms',
          unit_order: 2,
        }),
        makeRow({
          unit_slug: 'variables',
          unit_title: 'Variables and data types',
          unit_order: 1,
        }),
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res = await caller.getAllProgrammesForSubject.getProgrammeUnits({
      programme: 'computing-secondary-year-7',
    });

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${unitVariantLessonsView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[1]).toEqual({
      programme: 'computing-secondary-year-7',
    });

    expect(res).toStrictEqual([
      {
        unitSlug: 'variables',
        unitTitle: 'Variables and data types',
        unitOrder: 1,
      },
      { unitSlug: 'algorithms', unitTitle: 'Algorithms', unitOrder: 2 },
    ]);
  });

  it('uses optionality as the unit title when present', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [
        makeRow({
          unit_slug: 'poetry',
          unit_title: 'Poetry (base title)',
          unit_order: 1,
          optionality: 'Poetry: haiku or sonnet',
        }),
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res = await caller.getAllProgrammesForSubject.getProgrammeUnits({
      programme: 'english-primary-year-3',
    });

    expect(res[0]?.unitTitle).toBe('Poetry: haiku or sonnet');
  });

  it('returns NOT_FOUND when no units are found', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAllProgrammesForSubject.getProgrammeUnits({
        programme: 'computing-secondary-year-99',
      }),
    ).rejects.toMatchObject({ code: 'NOT_FOUND' });
  });
});

describe('/key-stages/{keyStage}/subject/{subject}/units', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('applies offset/limit pagination over deduplicated units', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [unitVariantLessonsView]: [
        makeKeyStageSubjectRow({
          unit_slug: 'year-3-unit-a',
          unit_title: 'Year 3 Unit A',
          year_slug: 'year-3',
        }),
        makeKeyStageSubjectRow({
          unit_slug: 'year-3-unit-b',
          unit_title: 'Year 3 Unit B',
          year_slug: 'year-3',
        }),
        makeKeyStageSubjectRow({
          unit_slug: 'year-4-unit-a',
          unit_title: 'Year 4 Unit A',
          year_slug: 'year-4',
        }),
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks1',
        subject: 'computing',
        offset: 1,
        limit: 1,
      });

    expect(res).toStrictEqual([
      {
        yearSlug: 'year-3',
        yearTitle: 'Year 3',
        units: [
          {
            unitSlug: 'year-3-unit-b',
            unitTitle: 'Year 3 Unit B',
          },
        ],
      },
    ]);
  });
});
