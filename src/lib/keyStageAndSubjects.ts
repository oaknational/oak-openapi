export const keyStageSlugs = source().map(({ slug }) => slug);
export const keyStages = source().map(({ slug, title }) => ({
  slug: slug,
  title: title,
}));

export const subjectsByKeyStage = (ks: string) =>
  source().filter(({ slug }) => ks === slug)[0].subjects;

export const subjectSlugs = Array.from(
  new Set(
    source().reduce(
      (acc: string[], { subjects }) =>
        acc.concat(subjects.map(({ slug }) => slug)),
      [],
    ),
  ),
);

export const subjectsWithKeyStages = () => {
  const obj = source().reduce(
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
    source()
      .map((_) => _.subjects)
      .flat()
      .map(({ title }) => title),
  ),
);

// note that these are pre-filtered by "new" lessons
function source() {
  return [
    {
      title: "Key Stage 1",
      slug: "ks1",
      subjects: [
        {
          slug: "english",
          title: "English",
        },
        {
          slug: "geography",
          title: "Geography",
        },
        {
          slug: "history",
          title: "History",
        },
        {
          slug: "maths",
          title: "Maths",
        },
        {
          slug: "science",
          title: "Science",
        },
      ],
    },
    {
      title: "Key Stage 2",
      slug: "ks2",
      subjects: [
        {
          slug: "english",
          title: "English",
        },
        {
          slug: "geography",
          title: "Geography",
        },
        {
          slug: "history",
          title: "History",
        },
        {
          slug: "maths",
          title: "Maths",
        },
        {
          slug: "science",
          title: "Science",
        },
      ],
    },
    {
      title: "Key Stage 3",
      slug: "ks3",
      subjects: [
        {
          slug: "english",
          title: "English",
        },
        {
          slug: "history",
          title: "History",
        },
        {
          slug: "maths",
          title: "Maths",
        },
        {
          slug: "music",
          title: "Music",
        },
        {
          slug: "science",
          title: "Science",
        },
      ],
    },
    {
      title: "Key Stage 4",
      slug: "ks4",
      subjects: [
        {
          slug: "biology",
          title: "Biology",
        },
        {
          slug: "chemistry",
          title: "Chemistry",
        },
        {
          slug: "combined-science",
          title: "Combined science",
        },
        {
          slug: "english",
          title: "English",
        },
        {
          slug: "history",
          title: "History",
        },
        {
          slug: "maths",
          title: "Maths",
        },
        {
          slug: "physics",
          title: "Physics",
        },
      ],
    },
  ];
}
