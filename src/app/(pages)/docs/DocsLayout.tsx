'use client';

import { CurriculumApiDocsNav } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import DocsNav from '@/components/documentationPages/DocsNav';
import 'highlight.js/styles/github.css';

import Footer from '@/components/Footer';

import { Navigation } from '@/components/Nav';
import { OakFlex } from '@oaknational/oak-components';
import { usePathname } from 'next/navigation';
import styled from 'styled-components';

const OakDocsFlex = styled(OakFlex)`
  gap: 40px;
}`;

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
      <OakDocsFlex
        $flexDirection={['column', 'row']}
        $mh={'auto'}
        $maxWidth={['all-spacing-21', 'all-spacing-24']}
      >
        <DocsNav items={navigationItems} location={location} />
        <a id="content" />
        {children}
      </OakDocsFlex>
      <Footer />
    </>
  );
}
