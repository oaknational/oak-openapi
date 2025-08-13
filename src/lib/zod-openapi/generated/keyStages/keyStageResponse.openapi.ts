import 'zod-openapi/extend';
import z from 'zod';

export const keyStageResponseOpenAPISchema = z
  .array(
    z.object({
      slug: z
        .string()
        .openapi({
          description: 'The key stage slug identifier',
          example: undefined,
        }),
      title: z
        .string()
        .openapi({ description: 'The key stage title', example: undefined }),
    }),
  )
  .openapi({
    ref: 'KeyStageResponseSchema',
    example: [{ slug: 'ks1', title: 'Key Stage 1' }],
  });
