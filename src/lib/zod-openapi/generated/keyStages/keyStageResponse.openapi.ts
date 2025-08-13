import 'zod-openapi/extend';
import z from 'zod';

export const keyStageResponseOpenAPISchema = z
  .array(
    z.object({
      slug: z.string({ description: 'The key stage slug identifier' }),
      title: z.string({ description: 'The key stage title' }),
    }),
  )
  .openapi({
    ref: 'KeyStageResponseSchema',
    example: [{ slug: 'ks1', title: 'Key Stage 1' }],
  });
