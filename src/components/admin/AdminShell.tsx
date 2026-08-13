'use client';

import { OakBox } from '@oaknational/oak-components';
import { MaxWidth } from '@/components/MaxWidth';
import { AdminNav } from './AdminNav';

/**
 * The chrome shared by every admin page.
 *
 * Rendered by each page rather than by the layout, so that a route has exactly
 * one client boundary — see the comment in layout.tsx for why that matters.
 */
export function AdminShell({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <OakBox $width="100%" $background="bg-primary" $color="text-primary">
      <MaxWidth
        $ph="spacing-16"
        $pv={['spacing-24', 'spacing-32']}
        $flexDirection="column"
      >
        <AdminNav />
        {children}
      </MaxWidth>
    </OakBox>
  );
}
