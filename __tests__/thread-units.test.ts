import { beforeEach, describe, expect, it, vi } from 'vitest';
import { sequenceView, threadView } from '@/lib/owaClient';

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

describe('/threads/{threadSlug}/units', () => {
  beforeEach(() => {
    mocks.owaClientRequestMock.mockReset();
  });

  it('queries the threads resolver and maps published thread units', async () => {
    mocks.owaClientRequestMock.mockResolvedValue({
      [threadView]: [
        {
          slug: 'number-multiplication-and-division',
        },
      ],
    });
    mocks.owaClientRequestMock.mockResolvedValueOnce({
      [threadView]: [
        {
          slug: 'number-multiplication-and-division',
        },
      ],
    });
    mocks.owaClientRequestMock.mockResolvedValueOnce({
      [sequenceView]: [
        {
          slug: 'first-unit',
          title: 'First unit',
          order: 1,
          year: '1',
        },
        {
          slug: 'second-unit',
          title: 'Second unit',
          order: 2,
          year: '2',
        },
      ],
    });

    const { authedCaller } = await import('./helper');
    const { caller } = authedCaller();

    const res = await caller.getThreads.getThreadUnits({
      threadSlug: 'number-multiplication-and-division',
    });

    expect(mocks.owaClientRequestMock).toHaveBeenCalledTimes(2);
    expect(mocks.owaClientRequestMock.mock.calls[0]?.[0]).toContain(
      `${threadView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[1]?.[0]).toContain(
      `${sequenceView}(`,
    );
    expect(mocks.owaClientRequestMock.mock.calls[1]?.[1]).toEqual({
      where: {
        non_curriculum: { _eq: false },
        state: { _eq: 'published' },
        threads: {
          _contains: [{ slug: 'number-multiplication-and-division' }],
        },
      },
    });
    expect(mocks.owaClientRequestMock.mock.calls[1]?.[0]).toContain(
      'query getThreadUnits',
    );
    expect(res).toEqual([
      {
        unitTitle: 'First unit',
        unitSlug: 'first-unit',
      },
      {
        unitTitle: 'Second unit',
        unitSlug: 'second-unit',
      },
    ]);
  });
});
