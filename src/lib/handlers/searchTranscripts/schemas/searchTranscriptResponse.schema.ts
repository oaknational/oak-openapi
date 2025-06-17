import z from 'zod';

export const searchTranscriptResponseSchema = z.array(
  z.object({
    lessonTitle: z.string(),
    lessonSlug: z.string(),
    transcriptSnippet: z.string().optional(),
  }),
);
