import * as z from 'zod/v4';

export const transcriptResponseSchema = z.object({
  transcript: z
    .string()
    .meta({ description: 'The transcript for the lesson video' }),
  vtt: z.string().meta({
    description:
      'The contents of the .vtt file for the lesson video, which maps captions to video timestamps.',
  }),
});
