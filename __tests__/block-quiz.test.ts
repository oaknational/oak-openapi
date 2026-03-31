import { expect, test } from 'vitest';
import { extractCauseFromTRPCError, makeCaller } from './helper';
import { TRPCError } from '@trpc/server';
import { checkLessonAllowedQuiz } from '@/lib/queryGate';
import quizBlockedLessons from '@/lib/queryGateData/quiz/blockedLessons.json' with { type: 'json' };

test('checkLessonAllowedQuiz blocks a quiz-blocked lesson', () => {
  const result = checkLessonAllowedQuiz(quizBlockedLessons[0]);
  expect(result.isBlocked()).toBe(true);
  expect(result.reason).toContain('quiz contains restricted content');
});

test('checkLessonAllowedQuiz allows a non-blocked lesson', () => {
  const result = checkLessonAllowedQuiz('joining-using-and');
  expect(result.isAllowed()).toBe(true);
});

test('quiz-blocked lesson throws on /lessons/{lesson}/quiz', async () => {
  const caller = makeCaller({ user: 1 });
  const slug = quizBlockedLessons[0];

  try {
    await caller.getQuestions.getQuestionsForLessons({ lesson: slug });
    expect.fail('Expected to throw an error for quiz-blocked content');
  } catch (e) {
    const error = e as TRPCError;
    expect(error instanceof TRPCError).toBe(true);
    expect(error.code).toBe('BAD_REQUEST');
    expect(extractCauseFromTRPCError(error)).toContain(
      'quiz contains restricted content',
    );
  }
});

test('non-blocked lesson returns quiz data on /lessons/{lesson}/quiz', async () => {
  const caller = makeCaller({ user: 1 });

  const res = await caller.getQuestions.getQuestionsForLessons({
    lesson: 'joining-using-and',
  });

  expect(Object.keys(res)).toEqual(['starterQuiz', 'exitQuiz']);
});

test('quiz-blocked lessons are filtered from /sequences/{sequence}/questions', async () => {
  const caller = makeCaller({ user: 1 });

  const res = await caller.getQuestions.getQuestionsForSequence({
    sequence: 'maths-secondary',
    year: 10,
    limit: 50,
    offset: 0,
  });

  const returnedSlugs = res.map((r) => r.lessonSlug);
  const blockedInResults = returnedSlugs.filter((slug) =>
    quizBlockedLessons.includes(slug),
  );

  expect(blockedInResults).toEqual([]);
});

test('quiz-blocked lessons are filtered from /key-stages/{keyStage}/subject/{subject}/questions', async () => {
  const caller = makeCaller({ user: 1 });

  const res = await caller.getQuestions.getQuestionsForKeyStageAndSubject({
    keyStage: 'ks1',
    subject: 'english',
  });

  const returnedSlugs = res.map((r) => r.lessonSlug);
  const blockedInResults = returnedSlugs.filter((slug) =>
    quizBlockedLessons.includes(slug),
  );

  expect(blockedInResults).toEqual([]);
});
