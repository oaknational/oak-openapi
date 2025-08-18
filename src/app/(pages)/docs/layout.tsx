import navDocsListQuery from '@/cms/queries/navDocsListQuery/navDocsListQuery.query';

import DocsLayout from './DocsLayout';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const navigationItems = await navDocsListQuery();

  return <DocsLayout children={children} navigationItems={navigationItems} />;
}
