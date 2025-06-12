// 'use client';
import Footer from '@/components/Footer';
import Banner from '@/components/landingPage/Banner';
// import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';
import navDocsListQuery from '@/cms/queries/navDocsListQuery/navDocsListQuery.query';
// import Nav from '@/components/landingPage/Nav';

// import { OakBox, OakMaxWidth } from '@oaknational/oak-components';
import DocsNav from '@/components/documentationPages/DocsNav';

type DocsLayoutProps = { navGroup: string; slug: string };

export default async function Layout({
  params,
  children,
}: {
  params: Promise<DocsLayoutProps>;
  children: React.ReactNode;
}) {
  const { navGroup, slug } = await params;
  const docs = await navDocsListQuery();

  console.log(docs, navGroup, slug);
  return (
    <>
      <Banner />
      <DocsNav items={docs.items} />
      {children}
      <Footer />
    </>
  );
}
