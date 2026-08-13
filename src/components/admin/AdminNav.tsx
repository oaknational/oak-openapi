// No 'use client' directive: this is only ever imported by AdminShell, which
// has one. Marking it too would make it a second client boundary — see the
// comment in layout.tsx.
import { OakFlex, OakHeading } from '@oaknational/oak-components';
import { usePathname } from 'next/navigation';
import { OakAPINavigationLink } from '@/components/OakAPINavigationLink';

const LINKS = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/new', label: 'New user' },
  { href: '/admin/users', label: 'All users' },
];

function isCurrent(pathname: string, href: string): boolean {
  return href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);
}

export function AdminNav(): React.ReactElement {
  const pathname = usePathname();

  return (
    <OakFlex
      as="nav"
      aria-label="Admin"
      $flexDirection={['column', 'row']}
      $alignItems={['flex-start', 'center']}
      $gap="spacing-24"
      $pv="spacing-16"
      $bb="border-solid-s"
      $borderColor="border-neutral-lighter"
      $mb="spacing-32"
    >
      <OakHeading tag="h1" $font="heading-6" $mr="spacing-8">
        API admin
      </OakHeading>
      <OakFlex $gap="spacing-24" $alignItems="center">
        {LINKS.map(({ href, label }) => {
          const current = isCurrent(pathname, href);
          return (
            <OakAPINavigationLink
              key={href}
              href={href}
              className={current ? 'selected' : undefined}
              aria-current={current ? 'page' : undefined}
            >
              {label}
            </OakAPINavigationLink>
          );
        })}
      </OakFlex>
    </OakFlex>
  );
}
