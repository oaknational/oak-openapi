import z from 'zod';

export const changelogLatestSchema = z.object({
  version: z.string(),
  date: z.string(),
  changes: z.array(z.string()),
});
