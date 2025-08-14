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
import EndpointBlock, { EndpointInfo } from './EndpointBlock';
// import { MaxWidth } from '../MaxWidth';

type CMSDocumentationProps = {
  endpoints?: EndpointInfo[];
  docs: DocumentationContentPageBlock[];
};

const OakGridArea = styled(_OakGridArea)`
  display: block;
  ${({ $gridArea }) => 'grid-area: ' + $gridArea};
`;

export default function MainDocsContent({
  docs,
  endpoints,
}: CMSDocumentationProps) {
  const isEndpointPage = endpoints && endpoints.length > 0;
  const contentsRaw =
    docs?.[0]?.docsBlocks?.filter(
      (_) => _.style === 'h2',
      // || _.style === 'h3',
    ) || [];

  let contents = isEndpointPage
    ? endpoints.map(({ title, slug }) => ({
        title,
        anchor: slug,
      }))
    : contentsRaw.map((content) => ({
        title: content.children.map((_) => _.text).join(' '),
        anchor: content._key,
      }));

  if (contents.length < 3) {
    contents = []; // Hide contents if there are less than 3 items
  }

  if (!docs || docs.length === 0) {
    return (
      <OakBox $color="black" $pv="inner-padding-xl3">
        <OakHeading tag="h1" $font="heading-3">
          No documentation available
        </OakHeading>
      </OakBox>
    );
  }

  const templateMobile =
    contents.length > 0 ? `"HEADER" "SIDENAV" "CONTENT"` : `"HEADER" "CONTENT"`;
  const templateDesktop =
    contents.length > 0
      ? `"HEADER SIDENAV" "CONTENT SIDENAV"`
      : `"HEADER" "CONTENT"`;

  return (
    <OakBox
      $color="black"
      $bl={['', 'border-solid-s']}
      $borderColor={['grey40', 'grey40']}
    >
      <OakGrid
        $gridTemplateColumns={[`1fr`, '1fr', `1fr 200px`]}
        $gridTemplateAreas={[templateMobile, templateMobile, templateDesktop]}
        $cg={['', 'space-between-s']}
        $rg="space-between-l"
        $pa={['all-spacing-4', 'all-spacing-8']}
        $pr={['', '', 'all-spacing-0']}
      >
        <OakGridArea $gridArea="HEADER">
          <OakHeading tag="p" $font="heading-light-6">
            {docs[0].navGroupType.name}
          </OakHeading>
          <OakHeading tag="h1" $font="heading-3">
            {docs[0].title}
          </OakHeading>
        </OakGridArea>
        <OakGridArea $gridArea="CONTENT">
          {docs.map((doc) => (
            <ContentPortableText
              key={doc.title}
              portableText={doc.docsBlocks}
            />
          ))}
          {isEndpointPage && (
            <OakFlex
              $pa="0"
              $gap="all-spacing-3"
              $ma="0"
              $flexDirection="column"
            >
              {endpoints.map((endpoint) => (
                <EndpointBlock endpoint={endpoint} key={endpoint.path} />
              ))}
            </OakFlex>
          )}
        </OakGridArea>

        {contents.length > 0 && (
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
                    <OakLink href={`#${content.anchor}`}>
                      {content.title}
                    </OakLink>
                  </OakLI>
                ))}
              </OakFlex>
            </OakFlex>
          </OakGridArea>
        )}
      </OakGrid>
    </OakBox>
  );
}
