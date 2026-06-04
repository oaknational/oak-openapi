import { describe, expect, test } from 'vitest';
import type { SubjectPhase } from '@/lib/owaClient';
import { phaseToSequences } from '@/lib/handlers/subjects/helpers';

function buildSubjectPhase(
  subjectSlug: string,
  ks4OptionSlugs: string[],
): SubjectPhase {
  return {
    cycle: '2',
    title: subjectSlug,
    slug: subjectSlug,
    keystages: [
      { slug: 'ks1', title: 'Key Stage 1' },
      { slug: 'ks2', title: 'Key Stage 2' },
      { slug: 'ks3', title: 'Key Stage 3' },
      { slug: 'ks4', title: 'Key Stage 4' },
    ],
    phases: [
      { slug: 'primary', title: 'Primary' },
      { slug: 'secondary', title: 'Secondary' },
    ],
    ks4_options: ks4OptionSlugs.map((slug) => ({ slug, title: slug })),
    display_order: 1,
  };
}

describe('phaseToSequences secondary slug rules', () => {
  test('excludes bare secondary when exam board sequence exists', () => {
    const sequences = phaseToSequences(buildSubjectPhase('english', ['aqa']));
    const slugs = sequences.map((s) => s.sequenceSlug);

    expect(slugs).toContain('english-secondary-aqa');
    expect(slugs).not.toContain('english-secondary');
  });

  test('excludes bare secondary when pathway sequence exists', () => {
    const sequences = phaseToSequences(
      buildSubjectPhase('computing', ['core']),
    );
    const slugs = sequences.map((s) => s.sequenceSlug);

    expect(slugs).toContain('computing-secondary-core');
    expect(slugs).not.toContain('computing-secondary');
  });

  test('returns bare secondary when no exam board/pathway options exist', () => {
    const subjectSlugs = ['maths', 'art', 'design-technology', 'rshe-pshe'];

    for (const subjectSlug of subjectSlugs) {
      const sequences = phaseToSequences(buildSubjectPhase(subjectSlug, []));
      const slugs = sequences.map((s) => s.sequenceSlug);

      expect(slugs).toContain(`${subjectSlug}-secondary`);
    }
  });

  test('maths secondary remains bare when not differentiated at KS4', () => {
    const sequences = phaseToSequences(buildSubjectPhase('maths', []));
    const secondarySlugs = sequences
      .filter((s) => s.phaseSlug === 'secondary')
      .map((s) => s.sequenceSlug);

    expect(secondarySlugs).toStrictEqual(['maths-secondary']);
  });
});
