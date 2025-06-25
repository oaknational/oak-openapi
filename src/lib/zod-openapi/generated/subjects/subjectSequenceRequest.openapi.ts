import 'zod-openapi/extend';
import { z } from 'zod';

export const subjectSequenceRequestOpenAPISchema = z
  .object({
    subject: z.string().openapi({ example: 'art' }),
  })
  .openapi({ example: { subject: 'art' } });
