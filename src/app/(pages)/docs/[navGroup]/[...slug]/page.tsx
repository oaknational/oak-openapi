import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';
import MainDocsContent from '@/components/documentationPages/MainDocsContent';
import type { DocumentationContentPageBlock } from '@/cms/schemaTypes';

export default async function Page({
  params,
}: {
  params: Promise<{ navGroup: string; slug: string[] }>;
}): Promise<React.ReactElement> {
  const { navGroup, slug } = await params;
  const pageSlug = slug[0];

  const documentationData = (await documentationBySlugQuery(
    navGroup,
    pageSlug,
  )) as DocumentationContentPageBlock[];

  return <MainDocsContent docs={documentationData} />;
}
