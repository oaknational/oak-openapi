'use client';

import { CurriculumApiDocsNav } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import DocsNav from '@/components/documentationPages/DocsNav';
import 'highlight.js/styles/github.css';

import Footer from '@/components/Footer';

import { Navigation } from '@/components/Nav';
import { OakFlex } from '@oaknational/oak-components';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function DocsLayout({
  children,
  navigationItems,
}: {
  children: React.ReactNode;
  navigationItems: CurriculumApiDocsNav;
}) {
  const location = usePathname();
  return (
    <>
      <Navigation />
      <Link rel="stylesheet" href="/docs.css" />
      <OakFlex
        $flexDirection={['column', 'row']}
        $mh={'auto'}
        $maxWidth={['all-spacing-21', 'all-spacing-24']}
        $gap="all-spacing-8"
      >
        <DocsNav items={navigationItems} location={location} />
        {children}
      </OakFlex>
      <Footer />
    </>
  );
}
