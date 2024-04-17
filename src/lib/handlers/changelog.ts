import { publicProcedure, router } from '~/lib/trpc';
import { z } from 'zod';

export const versions = [
  {
    version: '0.1.1',
    date: '2024-04-17',
    changes: [
      'Change `slug` and `title` to `unitSlug` and `unitTitle`, or `lessonSlug` etc.',
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
    .meta({ openapi: { method: 'GET', path: '/changelog' } })
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
});
