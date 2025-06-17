import 'zod-openapi/extend';
import z from 'zod';

export const transcriptResponseOpenAPISchema = z
  .object({
    transcript: z
      .string()
      .openapi({
        example:
          "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
      }),
    vtt: z
      .string()
      .openapi({
        example:
          "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
      }),
  })
  .openapi({
    example: {
      transcript:
        "Hello, I'm Mrs. Lashley. I'm looking forward to guiding you through your learning today...",
      vtt: "WEBVTT\n\n1\n00:00:06.300 --> 00:00:08.070\n<v ->Hello, I'm Mrs. Lashley.</v>\n\n2\n00:00:08.070 --> 00:00:09.240\nI'm looking forward to guiding you\n\n3\n00:00:09.240 --> 00:00:10.980\nthrough your learning today...",
    },
  });
