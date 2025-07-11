'use client';
import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea as _OakGridArea,
  OakHeading,
  OakLI,
  OakLink,
} from '@oaknational/oak-components';
import ContentPortableText from '@/cms/sanityResolvers/ContentPortableText';
import { DocumentationContentPageBlock } from '@/cms/schemaTypes';
import styled from 'styled-components';

type CMSDocumentationProps = {
  docs: DocumentationContentPageBlock[];
};

const OakGridArea = styled(_OakGridArea)`
  ${({ $gridArea }) => 'grid-area: ' + $gridArea};
`;

export default function MainDocsContent({ docs }: CMSDocumentationProps) {
  const contentsRaw =
    docs?.[0]?.docsBlocksRaw?.filter(
      (_) => _.style === 'h2' || _.style === 'h3',
    ) || [];

  const contents = contentsRaw.map((content) => ({
    title: content.children.map((_) => _.text).join(' '),
    anchor: content._key,
  }));

  if (!docs || docs.length === 0) {
    return (
      <OakBox $pv="inner-padding-xl3">
        <OakHeading tag="h1" $font="heading-3">
          No documentation available
        </OakHeading>
      </OakBox>
    );
  }

  return (
    <OakGrid
      $gridTemplateColumns={[`1fr`, '1fr', `1fr 300px`]}
      $gridTemplateAreas={[
        `"HEADER" "SIDENAV" "CONTENT"`,
        `"HEADER" "SIDENAV" "CONTENT"`,
        `"HEADER SIDENAV" "CONTENT SIDENAV"`,
      ]}
      $gap="space-between-s"
      $cg="space-between-s"
      $pa="all-spacing-8"
    >
      <OakGridArea $gridArea="HEADER">
        <OakHeading tag="p" $font="heading-light-6">
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
      </OakGridArea>
      <OakGridArea $gridArea="CONTENT">
        {docs.map((doc) => (
          <ContentPortableText
            key={doc.title}
            portableText={doc.docsBlocksRaw}
          />
        ))}
      </OakGridArea>

      <OakGridArea $gridArea="SIDENAV">
        <OakFlex $flexDirection="column" $gap="all-spacing-3">
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
      </OakGridArea>
    </OakGrid>
  );
}
