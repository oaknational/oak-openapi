import * as z from 'zod/v4';

const assetSchema = z.object({
  _id: z.string().optional(),
  url: z.string(),
  metadata: z.object({
    dimensions: z.object({
      height: z.number(),
      width: z.number(),
    }),
  }),
});

export const imageSchema = z.object({
  isPresentational: z.boolean().optional(),
  altText: z.string().optional(),
  asset: assetSchema,
});

export type CMSImage = z.infer<typeof imageSchema>;
export type Asset = z.infer<typeof assetSchema>;

export const cta = z.object({
  externalLink: z.string(),
  label: z.string(),
  icon: z.string().optional(),
  variant: z.enum(['primary', 'secondary']).optional(),
});

export interface CMSCta {
  externalLink: string;
  label: string;
  variant?: 'primary' | 'secondary';
  icon?: string;
  backgroundImageUrl?: { asset: Asset };
}

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
