export const versions = [
  {
    version: '0.5.0',
    date: '2025-03-06',
    changes: [
      'PPTX used for slideDeck assets',
      'All video assets now fully downloadable in mp4 format',
      'New /threads/* endpoints',
    ],
  },
  {
    version: '0.4.0',
    date: '2025-02-07',
    changes: [
      'Added /sequences/* and /subjects/* endpoints, and add support for unit optionality',
    ],
  },
  {
    version: '0.3.0',
    date: '2024-10-21',
    changes: ['Add `attribution` to asset endpoints'],
  },
  {
    version: '0.2.0',
    date: '2024-06-07',
    changes: [
      'Quiz and questions now include starterQuiz and exitQuiz as keys to the results, and separate the questions into their own array',
    ],
  },
  {
    version: '0.1.1',
    date: '2024-04-17',
    changes: [
      'Change `slug` and `title` to `unitSlug` and `unitTitle`, or `lessonSlug` etc',
      '/search/lessons/text-similarity changed to /search/lessons',
    ],
  },
  {
    version: '0.1.0',
    date: '2024-03-19',
    changes: ['Initial beta release'],
  },
];

export const getLatestVersion = (major: string) => {
  const found = versions.find((v) => v.version.startsWith(major + '.'));

  if (found) {
    return found.version;
  }

  return versions[0].version;
};

export const getLatestMajorVersion = () => {
  return versions[0].version.split('.')[0];
};
