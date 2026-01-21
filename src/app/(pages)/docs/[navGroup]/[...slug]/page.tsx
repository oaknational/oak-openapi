import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';
import MainDocsContent from '@/components/documentationPages/MainDocsContent';
import { getEndpointContent } from '@/lib/endpoint-docs/getEndpointDocs';
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

  const endpointInfo = getEndpointContent(pageSlug);
  return (
    <MainDocsContent
      endpoints={endpointInfo?.endpoints}
      docs={documentationData}
    />
  );
}
