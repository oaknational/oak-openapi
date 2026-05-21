import source from './keyStageAndSubjects.json' with { type: 'json' };

interface SlugTitle {
  slug: string;
  title: string;
}

export const keyStageSlugs = getSource().map(({ slug }) => slug);
export const keyStages = getSource().map(({ slug, title }) => ({
  slug: slug,
  title: title,
}));

export const subjectsByKeyStage = (ks: string): SlugTitle[] =>
  getSource().filter(({ slug }) => ks === slug)[0].subjects;

export const subjectSlugs = Array.from(
  new Set(
    getSource().reduce(
      (acc: string[], { subjects }) =>
        acc.concat(subjects.map(({ slug }) => slug)),
      [],
    ),
  ),
).sort();

interface SubjectWithKeyStages {
  subjectTitle: string;
  subjectSlug: string;
  keyStages: string[];
}

export const subjectsWithKeyStages = (): SubjectWithKeyStages[] => {
  const obj = getSource().reduce(
    (acc, { slug: keyStageSlug, subjects }) => {
      subjects.forEach(({ slug: subjectSlug, title }) => {
        if (!acc[subjectSlug]) {
          acc[subjectSlug] = {
            subjectTitle: title,
            subjectSlug,
            keyStages: new Set(),
          };
        }
        acc[subjectSlug].keyStages.add(keyStageSlug);
      });

      return acc;
    },
    {} as Record<
      string,
      { keyStages: Set<string>; subjectTitle: string; subjectSlug: string }
    >,
  );

  return Object.values(obj).map(({ keyStages, subjectTitle, subjectSlug }) => ({
    subjectTitle,
    subjectSlug,
    keyStages: Array.from(keyStages),
  }));
};

export const subjectTitleForSlug = (slug: string): string | null => {
  for (const { subjects } of getSource()) {
    for (const subject of subjects) {
      if (subject.slug === slug) {
        return subject.title;
      }
    }
  }
  return null;
};

export const subjects = Array.from(
  new Set(
    getSource()
      .map((_) => _.subjects)
      .flat()
      .map(({ title }) => title),
  ),
).sort((a, b) => a.localeCompare(b));

export interface SourceRecord {
  slug: string;
  title: string;
  subjects: { slug: string; title: string }[];
}

// note that these are pre-filtered by "new" lessons
function getSource(): SourceRecord[] {
  return Array.from(source);
}
