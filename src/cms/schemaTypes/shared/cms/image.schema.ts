import { z } from 'zod';

export const imageSchema = z.object({
  isPresentational: z.boolean().optional(),
  asset: z.object({ _id: z.string().optional(), url: z.string() }),
});

export type CMSImage = z.infer<typeof imageSchema>;

export const cta = z.object({
  externalLink: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  variant: z.enum(['primary', 'secondary']).optional(),
});

export type CMSCta = {
  externalLink: string;
  label: string;
  variant?: 'primary' | 'secondary';
  icon?: string;
};

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
