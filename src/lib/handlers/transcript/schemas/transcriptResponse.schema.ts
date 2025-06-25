import z from 'zod';

export const transcriptResponseSchema = z.object({
  transcript: z.string(),
  vtt: z.string(),
});
