'use client';
// import { OakBox } from '@oaknational/oak-components';
import React from 'react';

import DocsNav from '@/components/documentationPages/DocsNav';

import { NavItems } from '@/cms/schemaTypes/shared/components/NavItems.schema';
import { PortableTextJSON } from '@/cms/schemaTypes/shared/cms/portableText.schema';
import MainDocsContent from '@/components/documentationPages/MainDocsContent';

export type DocPageProps = {
  items: NavItems;
  content: PortableTextJSON;
};
export default function DocPage({ items, content }: DocPageProps) {
  return (
    <>
      <DocsNav items={items} />
      <MainDocsContent docs={content} />
    </>
  );
}
