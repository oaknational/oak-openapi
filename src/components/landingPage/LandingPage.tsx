'use client';
import Footer from '@/components/Footer';
import Head from 'next/head';
import { Navigation } from '@/components/Nav';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakImage,
  OakP as _OakP,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import type { UsingTheApiSection } from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import {
  transformContentBlocks,
  transformUsingTheAPI,
} from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import type { CMSCta, CurriculumApiLandingPage } from '@/cms/schemaTypes';
import { MaxWidth } from '../MaxWidth';
import { SanityCtaLink } from '../SanityCtaLink';

function OakP(props: (typeof _OakP)['props']): React.ReactElement {
  return <_OakP {...props} $mv="spacing-24" $color="text-primary" />;
}

const BlockHeading = styled(OakHeading)`
  em {
    display: inline-block;
    background-color: #bef2bd; /* FIXME: use oak token */
    padding: 0.1em 0.2em;
    text-decoration: none;
    font-style: normal;
  }
`;

export default function Page({
  documentationData,
}: {
  documentationData: CurriculumApiLandingPage;
}): React.ReactElement {
  const data = transformContentBlocks(documentationData);
  const usingTheAPI = transformUsingTheAPI(documentationData);
  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Navigation />
      <MaxWidth
        $ph="spacing-16"
        $flexDirection={'column'}
        $pv="spacing-64"
        $gap="spacing-120"
        $color={'text-primary'}
      >
        {data.map((data, index) => {
          return (
            <BlockAndText1
              key={index}
              title={data.title}
              description={data.description}
              image={data.image}
              link={data.link}
              align={
                index === 0 ? undefined : index % 2 == 0 ? 'left' : 'right'
              }
            />
          );
        })}
        <UsingTheAPI {...usingTheAPI} />
      </MaxWidth>
      <Footer />
    </>
  );
}

function UsingTheAPI({
  title,
  image,
  link,
  blocks,
}: UsingTheApiSection): React.ReactElement {
  return (
    <OakFlex
      $alignItems="center"
      $flexDirection={['column', 'row']}
      $gap="spacing-120"
    >
      <OakFlex
        $flexGrow={1}
        $flexDirection="column"
        $gap={['spacing-24', 'spacing-32']}
      >
        <BlockHeading tag="h1" $font={['heading-4', 'heading-3', 'heading-2']}>
          {title}
        </BlockHeading>
        {link && <SanityCtaLink value={link} />}
        <OakBox>
          {image && (
            <OakImage
              sizes={`width: ${343}px, height: ${288}px`}
              src={image.src}
              alt={image.altText || ''}
              $height={['spacing-360', 'spacing-480']}
              $width={['spacing-360', 'spacing-480']}
            />
          )}
        </OakBox>
      </OakFlex>
      <OakFlex
        $flexDirection="column"
        $gap={['spacing-24', 'spacing-48']}
        $alignSelf="baseline"
      >
        {blocks.map((block, index) => (
          <OakFlex
            key={index}
            $flexGrow={1}
            $flexDirection="column"
            $gap={['spacing-24', 'spacing-32']}
            $pa={['spacing-24', 'spacing-32']}
            $background="bg-decorative1-very-subdued"
          >
            <BlockHeading tag="h2" $font={['heading-5', 'heading-4']}>
              {block.title}
            </BlockHeading>
            <OakFlex $gap={['spacing-16']} $flexDirection="column">
              {typeof block.description === 'string' ? (
                <OakP>{block.description}</OakP>
              ) : (
                block.description
              )}
            </OakFlex>
            {block.link && <SanityCtaLink value={block.link} />}
          </OakFlex>
        ))}
      </OakFlex>
    </OakFlex>
  );
}

function BlockAndText1({
  title,
  description,
  image,
  link,
  align = 'left',
}: {
  title: string | React.ReactNode;
  description: string | React.ReactNode;
  image?: { src: string; width?: number; height?: number };
  link?: CMSCta;
  align?: 'left' | 'right';
}): React.ReactElement {
  const flexDirection = align === 'left' ? 'row' : 'row-reverse';

  return (
    <OakFlex
      $alignItems="center"
      $flexDirection={['column', flexDirection]}
      $gap="spacing-120"
    >
      <OakFlex
        $flexGrow={1}
        $flexDirection="column"
        $gap={['spacing-24', 'spacing-32']}
      >
        <BlockHeading tag="h1" $font={['heading-4', 'heading-3', 'heading-2']}>
          {title}
        </BlockHeading>
        <OakFlex $gap={['spacing-16']} $flexDirection="column">
          {typeof description === 'string' ? (
            <OakP $font={['body-2', 'body-1']}>{description}</OakP>
          ) : (
            description
          )}
        </OakFlex>
        {/* links are styled as SecondaryButtons */}
        {link && <SanityCtaLink value={link} />}
      </OakFlex>
      {image && (
        <OakFlex $flexGrow={1} $background="transparent">
          <OakImage
            sizes={`width: ${2228}px, height: ${1472}px`}
            src={image.src}
            alt=""
            $height={['spacing-360', 'spacing-480']}
            $width={['spacing-360', 'spacing-480']}
          />
        </OakFlex>
      )}
    </OakFlex>
  );
}
