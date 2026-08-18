import navDocsListQuery from '@/cms/queries/navDocsListQuery/navDocsListQuery.query';
import { headers } from 'next/headers';

import DocsLayout from './DocsLayout';

const MARKDOWN_RENDER_MODE_HEADER = 'x-markdown-render-mode';
const MARKDOWN_RENDER_MODE_BODY_ONLY = 'body-only';

export default async function Layout({
  children,
}: {
  children: React.ReactNode;
}): Promise<React.ReactElement> {
  const requestHeaders = await headers();
  const markdownRenderMode = requestHeaders.get(MARKDOWN_RENDER_MODE_HEADER);
  const showChrome = markdownRenderMode !== MARKDOWN_RENDER_MODE_BODY_ONLY;
  const navigationItems = await navDocsListQuery();

  return (
    <DocsLayout
      children={children}
      navigationItems={navigationItems}
      showChrome={showChrome}
    />
  );
}
