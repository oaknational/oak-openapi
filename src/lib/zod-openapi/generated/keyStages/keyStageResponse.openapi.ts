import * as z from 'zod/v4';

export const keyStageResponseOpenAPISchema = z
  .array(
    z.object({
      slug: z.string().meta({
        description: 'The key stage slug identifier',
        example: 'ks1',
      }),
      title: z.string().meta({
        description: 'The key stage title',
        example: 'Key Stage 1',
      }),
    }),
  )
  .meta({
    id: 'KeyStageResponseSchema',
    example: [{ slug: 'ks1', title: 'Key Stage 1' }],
  });
