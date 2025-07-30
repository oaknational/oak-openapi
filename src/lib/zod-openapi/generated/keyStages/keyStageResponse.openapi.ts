import 'zod-openapi/extend';
import z from 'zod';

export const keyStageResponseOpenAPISchema = z
  .array(
    z.object({
      slug: z
        .string()
        .openapi({ description: 'The key stage slug identifier' }),
      title: z.string().openapi({ description: 'The key stage title' }),
    }),
  )
  .openapi({
    example: [{ slug: 'ks1', title: 'Key Stage 1' }],
    ref: 'KeyStageResponseSchema',
  });
