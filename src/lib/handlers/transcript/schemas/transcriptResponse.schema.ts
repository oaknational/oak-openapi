import z from 'zod';

export const transcriptResponseSchema = z.object({
  transcript: z
    .string()
    .openapi({ description: 'The transcript for the lesson video' }),
  vtt: z.string().openapi({
    description:
      'The contents of the .vtt file for the lesson video, which maps captions to video timestamps.',
  }),
});
