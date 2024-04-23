import { publicProcedure, router } from '~/lib/trpc';
import { z } from 'zod';

export const versions = [
  {
    version: '0.1.1',
    date: '2024-04-17',
    changes: [
      'Change `slug` and `title` to `unitSlug` and `unitTitle`, or `lessonSlug` etc.',
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

export const changelog = router({
  changelog: publicProcedure
    .meta({
      openapi: { method: 'GET', path: '/changelog', tags: ['changelog'] },
    })
    .output(
      z.array(
        z.object({
          version: z.string(),
          date: z.string(),
          changes: z.array(z.string()),
        })
      )
    )
    .input(z.undefined())
    .query(async () => {
      return versions;
    }),
  latest: publicProcedure
    .meta({
      openapi: {
        method: 'GET',
        path: '/changelog/latest',
        tags: ['changelog'],
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
      })
    )
    .input(z.undefined())
    .query(async () => {
      return versions[0];
    }),
});
