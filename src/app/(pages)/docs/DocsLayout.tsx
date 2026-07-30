'use client';

import type { CurriculumApiDocsNav } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import DocsNav from '@/components/documentationPages/DocsNav';
import 'highlight.js/styles/github.css';

import Footer from '@/components/Footer';

import { Navigation } from '@/components/Nav';
import { OakFlex } from '@oaknational/oak-components';
import { usePathname } from 'next/navigation';

export default function DocsLayout({
  children,
  navigationItems,
  showChrome = true,
}: {
  children: React.ReactNode;
  navigationItems: CurriculumApiDocsNav;
  showChrome?: boolean;
}): React.ReactElement {
  const location = usePathname();
  return (
    <>
      {showChrome && <Navigation />}
      <OakFlex
        $flexDirection={['column', 'row']}
        $mh={'auto'}
        $maxWidth={['spacing-480', 'spacing-1280']}
        $gap="spacing-40"
      >
        {showChrome && <DocsNav items={navigationItems} location={location} />}
        <a id="content" />
        {children}
      </OakFlex>
      {showChrome && <Footer />}
    </>
  );
}
