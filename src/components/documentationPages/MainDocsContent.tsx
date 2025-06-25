'use client';
import { OakBox, OakHeading } from '@oaknational/oak-components';

import ContentPortableText from '@/cms/sanityResolvers/ContentPortableText';
import { DocumentationContentPageBlock } from '@/cms/schemaTypes';

type CMSDocumentationProps = {
  docs: DocumentationContentPageBlock[];
};

export default function MainDocsContent({ docs }: CMSDocumentationProps) {
  return (
    <OakBox>
      {docs && (
        <OakBox>
          <OakHeading
            ariaHidden
            tag="h1"
            $font="heading-5"
            $pa={'space-between-xl'}
          >
            {docs[0].title}
          </OakHeading>
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
