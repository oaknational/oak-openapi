import * as z from 'zod/v4';

export const changelogLatestSchema = z.object({
  version: z.string(),
  date: z.string(),
  changes: z.array(z.string()),
});
