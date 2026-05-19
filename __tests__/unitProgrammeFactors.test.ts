import { expect, test } from 'vitest';
import { getUnitProgrammeFactorsFromSequence } from '@/lib/handlers/unitProgrammeFactors';

const baseSequence = {
  examboard_slug: '',
  examboard: '',
  pathway_slug: '',
  pathway: '',
  tier_slug: '',
  tier: '',
  subject_slug: 'art',
  subject: 'Art and design',
  subject_parent: 'Art and design',
};

test('science child subject is exposed as a unit programme factor', () => {
  const factors = getUnitProgrammeFactorsFromSequence({
    ...baseSequence,
    subject_slug: 'biology',
    subject: 'Biology',
    subject_parent: 'Science',
  });

  expect(factors?.childSubject).toStrictEqual({
    slug: 'biology',
    title: 'Biology',
  });
});

test('non-science subject is not exposed as a child subject programme factor', () => {
  const factors = getUnitProgrammeFactorsFromSequence(baseSequence);

  expect(factors).toBeUndefined();
});
