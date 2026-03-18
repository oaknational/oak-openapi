import * as z from 'zod/v4';

export const keywordsRequestSchema = z.object({
  keyStage: z.string().describe('The key stage slug, e.g. "ks2"'),
  subject: z.string().describe('The subject slug, e.g. "science"'),
});
