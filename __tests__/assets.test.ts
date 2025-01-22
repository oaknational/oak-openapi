import { vi, expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import { EventEmitter } from 'events';

class Stream extends EventEmitter {
  pipe(res: { write: (data: Buffer) => void }) {
    setTimeout(() => this.emit('end'), 0);
    res.write(Buffer.from('%PDF-'));
    return vi.fn();
  }
}

vi.mock('@google-cloud/storage', () => {
  return {
    Storage: vi.fn().mockImplementation(() => {
      return {
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

test('read a video redirect', async () => {
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
