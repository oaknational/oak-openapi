import 'zod-openapi/extend';
import { unitListSchema } from '@/lib/handlers/threads/types';

export const threadUnitsResponseOpenAPISchema = unitListSchema.openapi({
  example: [
    {
      unitTitle:
        "A Midsummer Night's Dream, Shakespeare (Introduction and Act 1)",
      unitSlug:
        'a-midsummer-nights-dream-shakespeare-introduction-and-act-1-2912',
      unitOrder: 1,
    },
    {
      unitTitle: "A Midsummer Night's Dream, Shakespeare (Act 2)",
      unitSlug: 'a-midsummer-nights-dream-shakespeare-act-2-3c74',
      unitOrder: 2,
    },
  ],
});
