import { z } from 'zod';

export const imageSchema = z.object({
  isPresentational: z.boolean().optional(),
  asset: z.object({ _id: z.string().optional(), url: z.string() }),
});

export type CMSImage = z.infer<typeof imageSchema>;

export const cta = z.object({
  externalLink: z.string().nullable(),
  label: z.string().nullable(),
});

export type CMSCta = z.infer<typeof cta>;

export const raw = z.array(
  z.object({
    _key: z.string(),
    markDefs: z.array(z.unknown()),
    children: z.array(
      z.object({
        _type: z.string(),
        marks: z.array(z.unknown()),
        text: z.string(),
        _key: z.string(),
      }),
    ),
    _type: z.string(),
    style: z.string(),
  }),
);

export type CMSRaw = z.infer<typeof raw>;
