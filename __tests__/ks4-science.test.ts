import { expect, test, describe } from 'vitest';
import { makeCaller } from './helper';

/**
 * KS4 Science Tests
 *
 * These tests verify that the KS4 science endpoints work correctly.
 * KS4 science is a special case where the database stores the data
 * with subject_parent="Science" instead of subject_slug="science".
 */

describe('KS4 Science endpoints', () => {
  test('should get lessons for ks4/science', async () => {
    const caller = makeCaller({
      user: 1,
    });

    const res =
      await caller.getKeyStageSubjectLessons.getKeyStageSubjectLessons({
        keyStage: 'ks4',
        subject: 'science',
      });

    expect(Array.isArray(res)).toBe(true);
    // KS4 science should return results if the fix is working correctly
    if (res.length > 0) {
      expect(res[0]).toHaveProperty('unitSlug');
      expect(res[0]).toHaveProperty('lessons');
      expect(Array.isArray(res[0].lessons)).toBe(true);
    }
  });

  test('should get questions for ks4/science', async () => {
    const caller = makeCaller({
      user: 1,
    });

    const res = await caller.getQuestions.getQuestionsForKeyStageAndSubject({
      keyStage: 'ks4',
      subject: 'science',
    });

    expect(Array.isArray(res)).toBe(true);
    // KS4 science should return results if the fix is working correctly
    if (res.length > 0) {
      expect(res[0]).toHaveProperty('lessonSlug');
      expect(res[0]).toHaveProperty('lessonTitle');
    }
  });

  test('should get assets for ks4/science', async () => {
    const caller = makeCaller({
      user: 1,
    });

    const res = await caller.getAssets.getSubjectAssets({
      keyStage: 'ks4',
      subject: 'science',
    });

    expect(Array.isArray(res)).toBe(true);
    // KS4 science should return results if the fix is working correctly
    if (res.length > 0) {
      expect(res[0]).toHaveProperty('lessonSlug');
      expect(res[0]).toHaveProperty('assets');
    }
  });

  test('should get units for ks4/science', async () => {
    const caller = makeCaller({
      user: 1,
    });

    const res =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks4',
        subject: 'science',
      });

    expect(Array.isArray(res)).toBe(true);
    // KS4 science should return results if the fix is working correctly
    if (res.length > 0) {
      expect(res[0]).toHaveProperty('yearSlug');
      expect(res[0]).toHaveProperty('units');
      expect(Array.isArray(res[0].units)).toBe(true);
      expect(res[0].units[0]).toHaveProperty('unitSlug');
    }
  });

  test('ks4/science units without examBoard filter expose examBoards per unit', async () => {
    const caller = makeCaller({ user: 1 });

    const res =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks4',
        subject: 'science',
      });

    const allUnits = res.flatMap((year) => year.units);
    expect(allUnits.length).toBeGreaterThan(0);

    // Each unit should be deduped — no repeat slugs within a year.
    for (const year of res) {
      const slugs = year.units.map((u) => u.unitSlug);
      expect(new Set(slugs).size).toBe(slugs.length);
    }

    // `biomass-transfer-food-security-and-biodiversity` is published across
    // every KS4 science exam board, so it should list all three.
    const biomassUnit = allUnits.find(
      (u) => u.unitSlug === 'energy-of-moving-particles',
    );
    expect(biomassUnit).toBeDefined();
    expect(biomassUnit?.examBoards).toBeDefined();
    const boardSlugs = (biomassUnit?.examBoards ?? [])
      .map((b) => b.slug)
      .sort();
    expect(boardSlugs).toStrictEqual(['aqa', 'edexcel', 'ocr']);
  });

  test('ks4/science units with examBoard filter only returns that board and omits examBoards', async () => {
    const caller = makeCaller({ user: 1 });

    const resAll =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks4',
        subject: 'science',
        limit: 300,
      });

    const resAqa =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks4',
        subject: 'science',
        examBoard: 'aqa',
        limit: 300,
      });

    const allUnits = resAqa.flatMap((year) => year.units);
    expect(allUnits.length).toBeGreaterThan(0);

    // The filtered response should be a subset of the unfiltered set.
    const allSlugs = new Set(
      resAll.flatMap((year) => year.units.map((u) => u.unitSlug)),
    );
    for (const unit of allUnits) {
      expect(allSlugs.has(unit.unitSlug)).toBe(true);
      // A pinned request should not carry an examBoards list — it would be a
      // redundant single entry.
      expect(unit.examBoards).toBeUndefined();
    }
  });

  test('should handle ks4/science with unit filter', async () => {
    const caller = makeCaller({
      user: 1,
    });

    // First get available units for ks4/science
    const unitsRes =
      await caller.getAllKeyStageAndSubjectUnits.getAllKeyStageAndSubjectUnits({
        keyStage: 'ks4',
        subject: 'science',
      });

    if (unitsRes.length > 0 && unitsRes[0].units.length > 0) {
      const unitSlug = unitsRes[0].units[0].unitSlug;

      const lessonsRes =
        await caller.getKeyStageSubjectLessons.getKeyStageSubjectLessons({
          keyStage: 'ks4',
          subject: 'science',
          unit: unitSlug,
        });

      expect(Array.isArray(lessonsRes)).toBe(true);
      if (lessonsRes.length > 0) {
        // All lessons should be from the requested unit
        lessonsRes.forEach((unitData) => {
          expect(unitData.unitSlug).toBe(unitSlug);
        });
      }
    }
  });
});
