'use client';
import { OakBox } from '@oaknational/oak-components';

import React from 'react';

// import documentationQueryByNavGroup from '@/cms/queries/documentationQueryByNavGroup/documentation.query';
import ContentPortableText from '@/cms/sanityResolvers/ContentPortableText';
import { DocumentationContentPageBlock } from '@/cms/schemaTypes';
// import { PortableTextJSON } from '@/cms/schemaTypes/shared/portableText.schema';

type CMSDocumentationProps = {
  docs: DocumentationContentPageBlock[];
};

export default function MainDocsContent({ docs }: CMSDocumentationProps) {
  return (
    <OakBox>
      {docs && (
        <OakBox>
          {docs.map((doc) => (
            <ContentPortableText
              key={doc.title}
              portableText={doc.contentRaw}
            />
          ))}
        </OakBox>
      )}
    </OakBox>
  );
}
