import navDocsListQuery from '@/cms/queries/navDocsListQuery/navDocsListQuery.query';

import DocsLayout from './DocsLayout';
// import { getJSONData } from '@/lib/endpoint-docs/getEndpointDocs';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const navigationItems = await navDocsListQuery();

  return <DocsLayout children={children} navigationItems={navigationItems} />;
}
