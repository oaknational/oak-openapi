import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';
import MainDocsContent from '@/components/documentationPages/MainDocsContent';

export default async function Page({
  params,
}: {
  params: Promise<{ navGroup: string; slug: string[] }>;
}) {
  const { navGroup, slug } = await params;

  const documentationData = await documentationBySlugQuery(navGroup, slug[0]);

  return <MainDocsContent docs={documentationData} />;
}
