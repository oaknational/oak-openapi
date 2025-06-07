import { z } from 'zod';

export const blockTextSchema = z.array(
  z.object({
    _key: z.string(),
    _type: z.string(),
    children: z.array(
      z.object({
        _key: z.string(),
        _type: z.string(),
        marks: z.array(z.unknown()),
        text: z.string(),
      }),
    ),
    markDefs: z.array(z.unknown()),
    style: z.string(),
  }),
);

export type BlockText = z.infer<typeof blockTextSchema>;
