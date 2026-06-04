import { unitListSchema } from '@/lib/handlers/threads/types';

export const threadUnitsResponseOpenAPISchema = unitListSchema.meta({
  id: 'ThreadUnitsResponseSchema',
  example: [
    {
      unitTitle: 'Unitising and coin recognition - counting in 2s, 5s and 10s',
      unitSlug: 'unitising-and-coin-recognitions-counting-in-2s-5s-and-10s',
    },
    {
      unitTitle: 'Programming subroutines',
      unitSlug: 'programming-subroutines',
    },
    {
      unitTitle: 'Programming subroutines',
      unitSlug: 'programming-subroutines',
    },
  ],
});
