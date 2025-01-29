import source from './keyStageAndSubjects.json' assert { type: 'json' };

export const keyStageSlugs = getSource().map(({ slug }) => slug);
export const keyStages = getSource().map(({ slug, title }) => ({
  slug: slug,
  title: title,
}));

export const subjectsByKeyStage = (ks: string) =>
  getSource().filter(({ slug }) => ks === slug)[0].subjects;

export const subjectSlugs = Array.from(
  new Set(
    getSource().reduce(
      (acc: string[], { subjects }) =>
        acc.concat(subjects.map(({ slug }) => slug)),
      [],
    ),
  ),
);

export const subjectsWithKeyStages = () => {
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

export const subjects = Array.from(
  new Set(
    getSource()
      .map((_) => _.subjects)
      .flat()
      .map(({ title }) => title),
  ),
);

export type SourceRecord = {
  slug: string;
  title: string;
  subjects: { slug: string; title: string }[];
};

// note that these are pre-filtered by "new" lessons
function getSource(): SourceRecord[] {
  return Array.from(source);
}
