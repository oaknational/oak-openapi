import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'API admin - Oak National Academy',
  // Belt and braces alongside the Disallow: /admin in public/robots.txt.
  robots: { index: false, follow: false },
};

/**
 * Deliberately renders no Oak components. Each admin route has exactly one
 * 'use client' boundary (its page), which renders <AdminShell> for the chrome.
 * A client component here would make the layout a second, sibling boundary,
 * and styled-components assigns component ids from a runtime counter — two
 * boundaries hydrate from separate chunks in a different order than the server
 * rendered them, so every generated class name diverges and hydration fails.
 */
export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return <>{children}</>;
}
