import { expect, test } from 'vitest';
import { authedCaller, makeCaller } from './helper';
import type { TRPCError } from '@trpc/server';

test.only('get questions from hasura and check structure', async () => {
  const caller = makeCaller({
    user: 1,
    res: {
      setHeader() {},
    },
  });

  const resLesson = await caller.getQuestions.getQuestionsForLessons({
    lesson: 'joining-using-and',
  });

  expect(Object.keys(resLesson)).toEqual(['starterQuiz', 'exitQuiz']);

  const resLessons =
    await caller.getQuestions.getQuestionsForKeyStageAndSubject({
      keyStage: 'ks1',
      subject: 'english',
    });

  expect(Array.isArray(resLessons)).toBe(true);
  expect(Object.keys(resLessons[0])).toEqual(
    expect.arrayContaining(['starterQuiz', 'exitQuiz']),
  );
});

test('get questions for a sequence and test paging', async () => {
  const caller = makeCaller({
    user: 1,
    res: {
      setHeader() {},
    },
  });

  const res = await caller.getQuestions.getQuestionsForSequence({
    sequence: 'maths-secondary',
    year: 10,
    limit: 2,
    offset: 0,
  });

  expect(res.length).toBe(2);

  const first = res[0];

  expect(first).toHaveProperty('starterQuiz');
  expect(first).toHaveProperty('exitQuiz');

  expect(first.exitQuiz.length).toBeGreaterThan(0);
  expect(first.exitQuiz[0]).toHaveProperty('question');
  expect(first.exitQuiz[0]).toHaveProperty('questionType');

  const res2 = await caller.getQuestions.getQuestionsForSequence({
    sequence: 'maths-secondary',
    year: 10,
    limit: 2,
    offset: 2,
  });

  expect(res2.length).toBe(2);
  expect(res[0].lessonSlug).not.toBe(res2[0].lessonSlug);
});

test('errors cleanly if invalid parts', async () => {
  const { caller } = authedCaller();

  try {
    await caller.getQuestions.getQuestionsForSequence({
      sequence: 'science-secondary-osc', // incorrect exam board
      year: 10,
    });
    expect.fail('should have thrown');
  } catch (e) {
    const error = e as TRPCError;
    expect(error.message).toContain('Invalid exam board');
    expect(error.code).toBe('BAD_REQUEST');
  }
});

test('expect unique lessons for questions from sequence', async () => {
  const { caller } = authedCaller();

  const res = await caller.getQuestions.getQuestionsForSequence({
    sequence: 'science-secondary-ocr',
    year: 10,
  });

  const lessons = res.map((_) => _.lessonSlug);
  const uniqueLessons = Array.from(new Set(lessons));

  expect(lessons).toEqual(uniqueLessons);
});
