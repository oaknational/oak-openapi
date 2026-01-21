import * as z from 'zod/v4';

export const portableTextContentSchema = z.array(
  z.union([
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
      level: z.number(),
      listItem: z.string(),
      markDefs: z.array(z.unknown()),
      style: z.string(),
    }),
  ]),
);

export type PortableTextContent = z.infer<typeof portableTextContentSchema>;

export const portableTextSchema = z.array(z.any());

export type PortableTextJSON = z.infer<typeof portableTextSchema>;
