'use client';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakLI,
  OakLink,
} from '@oaknational/oak-components';
import ContentPortableText from '@/cms/sanityResolvers/ContentPortableText';
import { DocumentationContentPageBlock } from '@/cms/schemaTypes';

type CMSDocumentationProps = {
  docs: DocumentationContentPageBlock[];
};

export default function MainDocsContent({ docs }: CMSDocumentationProps) {
  const contentsRaw =
    docs?.[0]?.docsBlocksRaw?.filter((_) => _.style === 'h2') || [];

  const contents = contentsRaw.map((content) => ({
    title: content.children.map((_) => _.text).join(' '),
    anchor: content._key,
  }));

  return (
    <OakFlex $gap="space-between-s" $direction="column">
      <OakBox>
        {docs && (
          <OakBox $pv="inner-padding-xl3">
            <OakHeading
              tag="p"
              $font="heading-light-6
"
            >
              {docs[0].navGroupType.name}
            </OakHeading>
            <OakHeading
              ariaHidden
              tag="h1"
              $font="heading-3"
              $mb={'space-between-xl'}
            >
              {docs[0].title}
            </OakHeading>
            {docs.map((doc) => (
              <ContentPortableText
                key={doc.title}
                portableText={doc.docsBlocksRaw}
              />
            ))}
          </OakBox>
        )}
      </OakBox>

      <OakFlex
        $flexDirection="column"
        $gap="all-spacing-3"
        $pv="inner-padding-xl3"
      >
        <OakHeading tag="h2" $font="heading-7">
          <OakBox $width="200px">Contents</OakBox>
        </OakHeading>
        <OakFlex
          as="ul"
          $pa="0"
          $gap="all-spacing-3"
          $ma="0"
          $flexDirection="column"
        >
          {contents.map((content) => (
            <OakLI key={content.anchor}>
              <OakLink href={`#${content.anchor}`}>{content.title}</OakLink>
            </OakLI>
          ))}
        </OakFlex>
      </OakFlex>
    </OakFlex>
  );
}
