'use client';

import {
  OakCard,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakP,
} from '@oaknational/oak-components';
import { AdminShell } from './AdminShell';

const AREAS = [
  {
    heading: 'New user',
    href: '/admin/new',
    subCopy:
      'Create an API user and issue their first key. Optionally set a rate limit other than the default.',
  },
  {
    heading: 'All users',
    href: '/admin/users',
    subCopy:
      'Search API users, then open one to see their details and usage, change their rate limit, or regenerate their key.',
  },
];

export default function OverviewView(): React.ReactElement {
  return (
    <AdminShell>
      <OakHeading tag="h2" $font="heading-4" $mb="spacing-16">
        Manage API access
      </OakHeading>
      <OakP $mb="spacing-32">
        API users and their keys are stored in Redis. Changes here take effect
        immediately.
      </OakP>
      <OakGrid $cg="spacing-24" $rg="spacing-24">
        {AREAS.map((area) => (
          <OakGridArea key={area.href} $colSpan={[12, 6]}>
            <OakCard
              heading={area.heading}
              href={area.href}
              subCopy={area.subCopy}
              linkText="Open"
              linkIconName="chevron-right"
            />
          </OakGridArea>
        ))}
      </OakGrid>
    </AdminShell>
  );
}
