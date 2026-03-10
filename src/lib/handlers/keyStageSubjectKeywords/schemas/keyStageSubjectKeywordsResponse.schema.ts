import * as z from 'zod/v4';

export const keyStageSubjectKeywordsResponseSchema = z.array(
  z.object({
    keyword: z.string().describe('The keyword text'),
    description: z.string().describe('A description of the keyword'),
    lessonSlugs: z
      .array(z.string())
      .describe('The different lesson slugs where this keyword is used'),
  }),
);
