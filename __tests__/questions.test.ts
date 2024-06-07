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
    expect.arrayContaining(['starterQuiz', 'exitQuiz'])
  );
});
