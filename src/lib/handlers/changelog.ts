import { publicProcedure, router } from '~/lib/trpc';
import { z } from 'zod';
import { defaultCaching } from '../networkCache';

export const versions = [
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

export const changelog = router({
  changelog: publicProcedure
    .use(defaultCaching)
    .meta({
      openapi: {
        method: 'GET',
        path: '/changelog',
        tags: ['internal'],
        description:
          'History of significant changes to the API with associated dates and versions',
        example: {
          response: versions.slice(0, 2),
        },
      },
    })
    .output(
      z.array(
        z.object({
          version: z.string(),
          date: z.string(),
          changes: z.array(z.string()),
        }),
      ),
    )
    .input(z.undefined())
    .query(async () => {
      return versions;
    }),
  latest: publicProcedure
    .use(defaultCaching)
    .meta({
      openapi: {
        method: 'GET',
        path: '/changelog/latest',
        description:
          'Get the latest version and latest change note for the API',
        tags: ['internal'],
        example: {
          response: versions[0],
        },
      },
    })
    .output(
      z.object({
        version: z.string(),
        date: z.string(),
        changes: z.array(z.string()),
      }),
    )
    .input(z.undefined())
    .query(async () => {
      return versions[0];
    }),
});
