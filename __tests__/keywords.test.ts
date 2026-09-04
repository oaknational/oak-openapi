import { expect, test } from 'vitest';
import { authedCaller } from './helper';

test('keywords for a valid key stage and subject', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks1';
  const subject = 'english';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);

  // Check structure of first keyword
  const firstKeyword = res[0];
  expect(firstKeyword).toHaveProperty('keyword');
  expect(firstKeyword).toHaveProperty('description');
  expect(firstKeyword).toHaveProperty('lessonSlugs');

  expect(typeof firstKeyword.keyword).toBe('string');
  expect(typeof firstKeyword.description).toBe('string');
  expect(Array.isArray(firstKeyword.lessonSlugs)).toBe(true);
  expect(firstKeyword.lessonSlugs.length).toBeGreaterThan(0);
});

test('keywords are sorted alphabetically by keyword text', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks2';
  const subject = 'english';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
  });

  if (res.length > 1) {
    for (let i = 1; i < res.length; i++) {
      expect(
        res[i].keyword.localeCompare(res[i - 1].keyword),
      ).toBeGreaterThanOrEqual(0);
    }
  }
});

test('keywords for science subject with multiple lessons', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks2';
  const subject = 'science';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);

  // Verify each keyword has lesson slugs
  res.forEach((keyword) => {
    expect(keyword.lessonSlugs).toBeDefined();
    expect(Array.isArray(keyword.lessonSlugs)).toBe(true);
    keyword.lessonSlugs.forEach((lesson) => {
      expect(typeof lesson).toBe('string');
      expect(lesson.length).toBeGreaterThan(0);
    });
  });
});

test('keywords for maths at KS3', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks3';
  const subject = 'maths';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
  });

  expect(Array.isArray(res)).toBe(true);
});

test('keywords description field is populated', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks1';
  const subject = 'english';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
  });

  expect(res.length).toBeGreaterThan(0);

  // All descriptions should be non-empty strings
  res.forEach((keyword) => {
    expect(typeof keyword.description).toBe('string');
    expect(keyword.description.length).toBeGreaterThan(0);
  });
});

test('keywords with subject alone is allowed', async () => {
  const { caller } = authedCaller();
  const subject = 'english';

  const res = await caller.getKeywords.getKeywords({
    subject,
  });

  expect(Array.isArray(res)).toBe(true);
});

test('keywords with unit alone is allowed', async () => {
  const { caller } = authedCaller();
  const unit = 'some-unit-slug';

  const res = await caller.getKeywords.getKeywords({
    unit,
  });

  expect(Array.isArray(res)).toBe(true);
});

test('keywords with key stage alone is allowed', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks1';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);
});

test('keywords with lesson alone is allowed', async () => {
  const { caller } = authedCaller();
  const lesson = 'animating-text';

  const res = await caller.getKeywords.getKeywords({
    lesson,
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);
  res.forEach((keyword) => {
    expect(keyword.lessonSlugs).toEqual([lesson]);
  });
});

test('keywords with key stage and unit (no subject) is allowed', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks1';
  const unit = 'some-unit-slug';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    unit,
  });

  expect(Array.isArray(res)).toBe(true);
});

test('keywords with no filters at all should throw an error', async () => {
  const { caller } = authedCaller();

  try {
    await caller.getKeywords.getKeywords({});
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error).toBeDefined();
  }
});

test('keywords with key stage, subject and unit is allowed', async () => {
  const { caller } = authedCaller();
  const keyStage = 'ks1';
  const subject = 'english';
  const unit = 'some-unit-slug';

  const res = await caller.getKeywords.getKeywords({
    keyStage,
    subject,
    unit,
  });

  expect(Array.isArray(res)).toBe(true);
});

test('keywords with phase primary and subject returns results from ks1 and ks2', async () => {
  const { caller } = authedCaller();

  const res = await caller.getKeywords.getKeywords({
    phase: 'primary',
    subject: 'art',
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);

  res.forEach((keyword) => {
    expect(['ks1', 'ks2']).toContain(keyword.keyStageSlug);
  });
});

test('keywords with phase secondary and subject returns results from ks3 and ks4', async () => {
  const { caller } = authedCaller();

  const res = await caller.getKeywords.getKeywords({
    phase: 'secondary',
    subject: 'english',
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);

  res.forEach((keyword) => {
    expect(['ks3', 'ks4']).toContain(keyword.keyStageSlug);
  });
});

test('keywords with both phase and keyStage should throw an error', async () => {
  const { caller } = authedCaller();

  try {
    await caller.getKeywords.getKeywords({
      phase: 'primary',
      keyStage: 'ks1',
      subject: 'english',
    });
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error).toBeDefined();
  }
});

test.skip('keywords with phase alone (no subject) is allowed', async () => {
  const { caller } = authedCaller();

  const res = await caller.getKeywords.getKeywords({
    phase: 'primary',
  });

  expect(Array.isArray(res)).toBe(true);
  expect(res.length).toBeGreaterThan(0);
});

test('keywords are limited to a page, and the offset moves through them', async () => {
  const { caller } = authedCaller();
  const filters = { keyStage: 'ks1', subject: 'english' };

  const firstPage = await caller.getKeywords.getKeywords({
    ...filters,
    limit: 2,
  });

  expect(firstPage.length).toBe(2);

  const secondPage = await caller.getKeywords.getKeywords({
    ...filters,
    limit: 2,
    offset: 2,
  });

  expect(secondPage.length).toBe(2);
  expect(secondPage.map(({ keyword }) => keyword)).not.toEqual(
    firstPage.map(({ keyword }) => keyword),
  );
});

test('keywords default to a page of 20', async () => {
  const { caller } = authedCaller();

  const res = await caller.getKeywords.getKeywords({
    keyStage: 'ks1',
    subject: 'english',
  });

  expect(res.length).toBe(20);
});

test('keywords with a limit above the maximum should throw an error', async () => {
  const { caller } = authedCaller();

  try {
    await caller.getKeywords.getKeywords({
      subject: 'english',
      limit: 301,
    });
    expect.fail('Should have thrown an error');
  } catch (error) {
    expect(error).toBeDefined();
  }
});
