import { vi, expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import { downloadTypeEnum } from '~/lib/handlers/assets';

vi.mock('@google-cloud/storage', async () => {
  const { EventEmitter } = await import('events');
  class Stream extends EventEmitter {
    pipe(res: { write: (data: Buffer) => void }) {
      setTimeout(() => this.emit('end'), 0);
      res.write(Buffer.from('%PDF-'));
      return vi.fn();
    }
  }
  return {
    Storage: vi.fn().mockImplementation(() => {
      return {
        getFiles: vi.fn().mockResolvedValue([
          [
            {
              name: 'LESS-ID/slidedeck/PDF.pdf',
              metadata: {
                contentType: 'application/pdf',
              },
            },
            {
              name: 'LESS-ID/slidedeck/PowerPoint.pptx',
              metadata: {
                contentType:
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              },
            },
          ],
        ]),
        bucket: vi.fn().mockReturnThis(),
        file: vi.fn().mockReturnThis(),
        createReadStream() {
          return new Stream();
        },
      };
    }),
  };
});

test('get asset urls for maths lesson', async () => {
  const caller = makeCaller({
    user: 1,
  });

  const res = await caller.getAssets.getLessonAssets({
    lesson: 'checking-understanding-of-perimeter',
  });

  expect(res).toHaveProperty('attribution');
  expect(res).toHaveProperty('assets');
  if (!('assets' in res) || res.assets === undefined) {
    throw new Error('assets not found in response');
  }
  expect(res.assets.length).toBeGreaterThan(0);
});

test('read a single asset (pdf)', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  const res = await caller.getAssets.getLessonAsset({
    lesson: 'checking-understanding-of-perimeter',
    type: 'slideDeck',
  });

  expect(typeof res).toBe('undefined');

  expect(request.write).toHaveBeenCalled();
  const call = request.write.mock.calls[0][0];
  expect(call).toBeInstanceOf(Buffer);
  const header = call.toString('ascii', 0, 5);
  expect(header).toBe('%PDF-');
});

test('request power point', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  await caller.getAssets.getLessonAsset({
    lesson: 'checking-understanding-of-perimeter',
    type: 'slideDeck',
  });

  // expects the content disposition to be set last (i.e. after the content type)
  expect(request.setHeader.mock.lastCall[1].endsWith('.pptx"')).toBe(true);

  await caller.getAssets.getLessonAsset({
    lesson: 'checking-understanding-of-perimeter',
    type: 'exitQuiz',
  });

  expect(request.setHeader.mock.lastCall[1].endsWith('.pdf"')).toBe(true);
});

// this can be stored when we have more lessons that do actually redirect
// ideally we don't ever redirect, but I've kept this for the future
test.skip('read a video redirect', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  const res = await caller.getAssets.getLessonAsset({
    lesson: 'checking-understanding-of-perimeter',
    type: 'video',
  });

  expect(typeof res).toBe('undefined');

  expect(request.writeHead).toHaveBeenCalled();
  const call = request.writeHead.mock.calls[0];

  expect(call[0]).toBe(302);
  let key = 'Location';
  if (!call[1].hasOwnProperty(key)) {
    key = 'location';
  }
  expect(call[1]).toHaveProperty(key);
  expect(call[1][key]).toMatch(/https:\/\/stream\.video\.thenational\.academy/);
});

test('sequence assets and paging', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  let res = await caller.getAssets.getSequenceAssets({
    sequence: 'maths-secondary',
    type: 'slideDeck',
    year: 10,
    limit: 2,
    offset: 0,
  });

  expect(res.length).toBe(2);

  const first = res[0];

  expect(first).toHaveProperty('lessonSlug');
  expect(first).toHaveProperty('assets');
  expect(first.assets.length).toBeGreaterThan(0);
  expect(first.assets[0]).toHaveProperty('type');
  expect(first.assets[0].type).toBe('slideDeck');

  res = await caller.getAssets.getSequenceAssets({
    sequence: 'maths-secondary',
    type: 'slideDeck',
    year: 10,
    limit: 2,
    offset: 2,
  });

  expect(res.length).toBe(2);
  expect(res.map((r) => r.lessonSlug)).not.toContain(first.lessonSlug);

  // check the other types - but ignore supplementaryResource as it's not always there
  const types = Object.values(downloadTypeEnum.enum).filter(
    (_) => _ !== 'slideDeck' && _ !== 'supplementaryResource',
  );

  for (const type of types) {
    res = await caller.getAssets.getSequenceAssets({
      sequence: 'maths-secondary',
      type,
      year: 10,
      limit: 2,
      offset: 2,
    });
    expect(res.length).toBe(2);
    expect(res[0].assets.length, `${type} has zero assets`).toBeGreaterThan(0);
  }
});
