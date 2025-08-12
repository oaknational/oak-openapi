import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';
import EndpointDocsContent from '@/components/documentationPages/EndpointDocsContent';
import MainDocsContent from '@/components/documentationPages/MainDocsContent';
import { getEndpointContent } from '@/lib/endpoint-docs/getEndpointDocs';

export default async function Page({
  params,
}: {
  params: Promise<{ navGroup: string; slug: string[] }>;
}) {
  const { navGroup, slug } = await params;
  const pageSlug = slug[0];

  const documentationData = await documentationBySlugQuery(navGroup, pageSlug);

  if (navGroup === 'api-endpoints' && pageSlug !== 'endpoints-overview') {
    const endpointInfo = await getEndpointContent(pageSlug);
    return (
      endpointInfo && (
        <EndpointDocsContent
          endpoints={endpointInfo.endpoints}
          title={endpointInfo.title}
          slug={pageSlug}
          cmsContent={documentationData}
        />
      )
    );
  } else {
    return <MainDocsContent docs={documentationData} />;
  }
}
