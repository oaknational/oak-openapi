// import { OakBox } from '@oaknational/oak-components';

import React from 'react';
import navDocsListQuery from '@/cms/queries/navDocsListQuery/navDocsListQuery.query';
// import DocsNav from '@/components/documentationPages/DocsNav';
import DocPage from './doc';
// import documentationQuery from '@/cms/queries/allDocumentationQuery/documentation.query';
// import ContentPortableText from '@/cms/sanityResolvers/ContentPortableText';

// import { DocumentationQuery } from '@/cms/queries/allDocumentationQuery/documentationQuery.schema';
// import Link from 'next/link';
// import documentationBySlugQuery from '@/cms/queries/documentationBySlugQuery/documentationBySlugQuery.query';

export default async function DocsPage(
  params: Promise<{
    navGroup: string;
    slug: string;
  }>,
) {
  const { navGroup, slug } = await params;
  const { items } = await navDocsListQuery();
  // const documentationData = await documentationBySlugQuery(navGroup, slug);

  // documentationData.forEach((doc) => {
  //   console.log(doc.contentRaw);
  // });
  return (
    <>
      <p>{navGroup}</p>
      <p>{slug}</p>
      <DocPage items={items} content={[]} />
      {/* <Link href="/docs/about-oaks-api" /> */}
      {/* <MainDoc
      <Main docs={documentationData} /> */}
    </>
  );
}
