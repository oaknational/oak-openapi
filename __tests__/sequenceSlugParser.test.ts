import { expect, test } from 'vitest';
import { parseSubjectPhaseSlug } from '@/lib/sequenceSlugParser';

test('parse sequence slug', () => {
  const slug = 'english-primary';
  const result = parseSubjectPhaseSlug(slug);
  expect(result).toEqual({
    phaseSlug: 'primary',
    subjectSlug: 'english',
    ks4OptionSlug: null,
  });
});

test('subject with dash', () => {
  const slugs = [
    'physical-education-primary',
    'physical-education-secondary-aqa',
    'physical-education-secondary-core',
    'physical-education-secondary-edexcel',
    'physical-education-secondary-gcse',
    'physical-education-secondary-ocr',
  ];

  slugs.forEach((slug) => {
    const result = parseSubjectPhaseSlug(slug);
    expect(result?.subjectSlug).toEqual('physical-education');
  });
});

test('garbage', () => {
  const slugs = ['x-core', 'physical-education-second-aqa-core'];

  slugs.forEach((slug) => {
    expect(() => parseSubjectPhaseSlug(slug)).toThrowError();
  });
});
