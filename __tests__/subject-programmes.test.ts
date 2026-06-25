import { beforeEach, describe, expect, it, vi } from 'vitest';
import { programmesByYearView } from '@/lib/owaClient';

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

describe('/subjects/{subject}/programmes', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('queries programmes by subject', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [programmesByYearView]: [
        { programme_slug: 'computing-secondary-year-7' },
        { programme_slug: 'computing-secondary-year-8' },
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res =
      await caller.getAllProgrammesForSequence.getAllProgrammesForSequence({
        subject: 'computing',
      });

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${programmesByYearView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      'is_legacy',
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[1]).toEqual({
      subjectMatch: {
        subject_slug: 'computing',
      },
    });
    expect(res).toStrictEqual([
      'computing-secondary-year-7',
      'computing-secondary-year-8',
    ]);
  });

  it('sorts programme slugs with numeric ordering', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [programmesByYearView]: [
        { programme_slug: 'maths-primary-year-10' },
        { programme_slug: 'maths-primary-year-2' },
        { programme_slug: 'maths-primary-year-1' },
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res =
      await caller.getAllProgrammesForSequence.getAllProgrammesForSequence({
        subject: 'maths',
      });

    expect(res).toStrictEqual([
      'maths-primary-year-1',
      'maths-primary-year-2',
      'maths-primary-year-10',
    ]);
  });

  it('returns BAD_REQUEST for an invalid subject slug', async () => {
    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAllProgrammesForSequence.getAllProgrammesForSequence({
        subject: 'not-a-valid-subject',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(mocks.owaClientRequestMock).not.toHaveBeenCalled();
  });

  it('returns metadata for a specific programme', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [programmesByYearView]: [
        {
          programme_fields: {
            tier: null,
            year: 'Year 7',
            phase: 'Secondary',
            pathway: null,
            subject: 'Computing',
            keystage: 'Key Stage 3',
            examboard: null,
            tier_slug: null,
            year_slug: 'year-7',
            phase_slug: 'secondary',
            pathway_slug: null,
            subject_slug: 'computing',
            keystage_slug: 'ks3',
            examboard_slug: null,
          },
        },
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res = await caller.getAllProgrammesForSequence.getProgramme({
      subject: 'computing',
      programme: 'computing-secondary-year-7',
    });

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(1);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${programmesByYearView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[1]).toEqual({
      programme: 'computing-secondary-year-7',
    });

    expect(res).toStrictEqual({
      examboardSlug: null,
      examboardTitle: null,
      keystageSlug: 'ks3',
      keystageTitle: 'Key Stage 3',
      pathwaySlug: null,
      pathwayTitle: null,
      phaseSlug: 'secondary',
      phaseTitle: 'Secondary',
      subjectSlug: 'computing',
      subjectTitle: 'Computing',
      tierSlug: null,
      tierTitle: null,
      yearSlug: 'year-7',
      yearTitle: 'Year 7',
    });
  });

  it('throws when programme is not found', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [programmesByYearView]: [],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAllProgrammesForSequence.getProgramme({
        subject: 'computing',
        programme: 'computing-secondary-year-999',
      }),
    ).rejects.toThrow('Programme not found: computing-secondary-year-999');
  });

  it('returns BAD_REQUEST for getProgramme with invalid subject slug', async () => {
    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAllProgrammesForSequence.getProgramme({
        subject: 'not-a-valid-subject',
        programme: 'computing-secondary-year-7',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(mocks.owaClientRequestMock).not.toHaveBeenCalled();
  });
});
