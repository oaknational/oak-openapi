import 'zod-openapi';
import * as z from 'zod/v4';
export const transcriptResponseOpenAPISchema = z
  .object({
    transcript: z.string().meta({
      description: 'The transcript for the lesson video',
      example:
        "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
    }),
    vtt: z.string().meta({
      description:
        'The contents of the .vtt file for the lesson video, which maps captions to video timestamps.',
      example:
        "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
    }),
  })
  .meta({
    id: 'TranscriptResponseSchema',
    example: {
      transcript:
        "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
      vtt: "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
    },
  });
