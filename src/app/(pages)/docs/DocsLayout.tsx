'use client';

import { NavItems } from '@/cms/schemaTypes';
import DocsNav from '@/components/documentationPages/DocsNav';

import Footer from '@/components/Footer';

import { Navigation } from '@/components/Nav';
import { OakFlex } from '@oaknational/oak-components';

export default function DocsLayout({
  children,
  docsPageListItems,
}: {
  children: React.ReactNode;
  docsPageListItems: NavItems;
}) {
  return (
    <>
      <Navigation />
      <OakFlex
        $flexDirection="row"
        $mh={'auto'}
        $maxWidth={['all-spacing-21', 'all-spacing-24']}
      >
        <DocsNav items={docsPageListItems} />
        {children}
      </OakFlex>
      <Footer />
    </>
  );
}
