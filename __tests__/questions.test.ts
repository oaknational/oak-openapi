import { expect, test } from 'vitest';
import { makeCaller } from './helper';

test('get questions from hasura and check structure', async () => {
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
