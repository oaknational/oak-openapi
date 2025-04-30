import { vi, expect, test } from 'vitest';
import { makeCaller, makeRes } from './helper';
import {
  getVideoFromMux,
  // isApprovedLesson,
} from '~/lib/handlers/assets';

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

test('lessons in the supported lessons array are allowed', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  // this will throw if the lesson is not allowed, which
  // is all we're testing for
  const res = await caller.getAssets.getLessonAsset({
    lesson: 'identifying-unknown-substances-including-barium',
    type: 'slideDeck',
  });

  expect(typeof res).toBe('undefined');
});

test('lessons not in the supported lessons array are not allowed', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  await expect(
    async () =>
      await caller.getAssets.getLessonAsset({
        lesson: 'made up lesson for testing',
        type: 'video',
      }),
  ).rejects.toThrow('Lesson not available');
});

test('cycling down the quality of videos against mux', async () => {
  const streamUrl =
    'https://stream.video.thenational.academy/yD02mc00PWTu0201HlC9S8vC012R01m6Njvcvxbz2WzJzJISo.m3u8';

  const resultUrl = await getVideoFromMux(streamUrl, 'high');

  expect(resultUrl.endsWith('.mp4')).toBe(true);
  expect(resultUrl.endsWith('high.mp4')).toBe(false);
});

test('blocked lesson: growing-rearing-and-catching-our-food', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  const slug = 'growing-rearing-and-catching-our-food';

  await expect(
    async () =>
      await caller.getAssets.getLessonAsset({
        lesson: slug,
        type: 'slideDeck',
      }),
  ).rejects.toThrow('Lesson not available');

  // make sure it doesn't also turn up in the sequence assets
  const res = await caller.getAssets.getSequenceAssets({
    sequence: 'cooking-nutrition-secondary',
  });

  expect(res.map((a) => a.lessonSlug)).not.toContain(slug);
  expect(res.length).toBeGreaterThan(0);

  const ksres = await caller.getAssets.getSubjectAssets({
    subject: 'cooking-nutrition',
    keyStage: 'ks3',
  });

  expect(ksres.map((a) => a.lessonSlug)).not.toContain(slug);
});

test('unblocked lesson: making-yakisoba-noodles', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  const slug = 'making-yakisoba-noodles';

  // if this throws then the lesson is blocked
  await caller.getAssets.getLessonAsset({
    lesson: slug,
    type: 'slideDeck',
  });

  // make sure it doesn't also turn up in the sequence assets
  const res = await caller.getAssets.getSequenceAssets({
    sequence: 'cooking-nutrition-secondary',
  });

  expect(res.map((a) => a.lessonSlug)).toContain(slug);
  expect(res.length).toBeGreaterThan(0);

  const ksres = await caller.getAssets.getSubjectAssets({
    subject: 'cooking-nutrition',
    keyStage: 'ks3',
  });

  expect(ksres.map((a) => a.lessonSlug)).toContain(slug);
});

test('financial education is hidden: returns invalid enum value', async () => {
  const request = makeRes();
  const caller = makeCaller(
    {
      user: 1,
    },
    request,
  );

  const slug = 'financial-education';

  await expect(
    async () =>
      await caller.getAssets.getSubjectAssets({
        subject: slug,
        keyStage: 'ks2',
        type: 'slideDeck',
      }),
  ).rejects.toThrow('Invalid enum value');
});

// test('isApprovedLesson: blocked subjects return false', () => {
//   expect(isApprovedLesson('english', 'poetry', 'lesson 1')).toBe(false);
// });

// test('isApprovedLesson: made up subjects return false', () => {
//   expect(
//     isApprovedLesson(
//       'defence-against-dark-arts',
//       'defensive-spells',
//       'protego',
//     ),
//   ).toBe(false);
// });

// test('isApprovedLesson: supported subject returns true', () => {
//   expect(isApprovedLesson('maths', 'unit-1', 'lesson-1')).toBe(true);
// });

// test('isApprovedLesson: supported unit returns true', () => {
//   expect(
//     isApprovedLesson(
//       'english',
//       'apostrophes-and-speech-punctuation',
//       'lesson-1',
//     ),
//   ).toBe(true);
// });

// test('isApprovedLesson: random unit returns false', () => {
//   expect(isApprovedLesson('english', 'random-unit', 'lesson-1')).toBe(false);
// });

// test('isApprovedLesson: random lesson returns false', () => {
//   expect(isApprovedLesson('english', 'random-unit', 'lesson-1')).toBe(false);
// });
