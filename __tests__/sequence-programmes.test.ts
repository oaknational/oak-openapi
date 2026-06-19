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

describe('/sequences/{sequence}/programmes', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('queries programmes by parsed subject and phase', async () => {
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
        sequence: 'computing-secondary',
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
        phase_slug: 'secondary',
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
        sequence: 'maths-primary',
      });

    expect(res).toStrictEqual([
      'maths-primary-year-1',
      'maths-primary-year-2',
      'maths-primary-year-10',
    ]);
  });

  it('returns BAD_REQUEST for an invalid sequence slug', async () => {
    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    await expect(
      caller.getAllProgrammesForSequence.getAllProgrammesForSequence({
        sequence: 'not-a-valid-sequence',
      }),
    ).rejects.toMatchObject({ code: 'BAD_REQUEST' });

    expect(mocks.owaClientRequestMock).not.toHaveBeenCalled();
  });
});
