import { expect, test } from 'vitest';
import { getAllLessonData } from '@/lib/bulk-data/get-data';

const hasGraphQLEnv = Boolean(
  process.env.OAK_GRAPHQL_HOST && process.env.OAK_GRAPHQL_SECRET,
);
const runLiveBulkDataTest = process.env.RUN_LIVE_BULK_DATA_TESTS === 'true';

test.skipIf(!hasGraphQLEnv || !runLiveBulkDataTest)(
  'getAllLessonData returns valid data from the real environment',
  async () => {
    const testUnitSlug =
      process.env.BULK_LIVE_TEST_UNIT_SLUG ?? 'programming-subroutines';
    const lessons = await getAllLessonData(testUnitSlug);

    expect(Array.isArray(lessons)).toBe(true);
    expect(lessons.length).toBeGreaterThan(0);

    for (const lesson of lessons) {
      expect(typeof lesson.lessonTitle).toBe('string');
      expect(lesson.lessonTitle?.length).toBeGreaterThan(0);
      expect(typeof lesson.lessonSlug).toBe('string');
      expect(lesson.lessonSlug?.length).toBeGreaterThan(0);
      expect(typeof lesson.unitSlug).toBe('string');
      expect(lesson.unitSlug).toBe(testUnitSlug);
      expect(typeof lesson.unitTitle).toBe('string');
      expect(lesson.unitTitle?.length).toBeGreaterThan(0);
      expect(typeof lesson.subjectSlug).toBe('string');
      expect(lesson.subjectSlug?.length).toBeGreaterThan(0);
      expect(typeof lesson.keyStageSlug).toBe('string');
      expect(lesson.keyStageSlug?.length).toBeGreaterThan(0);
      expect(typeof lesson.downloadsAvailable).toBe('boolean');

      if (lesson.transcript_sentences != null) {
        expect(typeof lesson.transcript_sentences).toBe('string');
        expect(lesson.transcript_sentences.length).toBeGreaterThan(0);
      }

      if (lesson.transcript_vtt != null) {
        expect(typeof lesson.transcript_vtt).toBe('string');
        expect(lesson.transcript_vtt.length).toBeGreaterThan(0);
      }
    }
  },
);
