import 'zod-openapi/extend';
import z from 'zod';

export const keyStageResponseOpenAPISchema = z
  .array(
    z.object({
      slug: z.string(),
      title: z.string(),
    }),
  )
  .openapi({ example: [{ slug: 'ks1', title: 'Key Stage 1' }] });
