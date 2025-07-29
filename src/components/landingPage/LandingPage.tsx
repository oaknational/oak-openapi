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
import {
  transformContentBlocks,
  transformUsingTheAPI,
  UsingTheApiSection,
} from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import { CMSCta, CurriculumApiLandingPage } from '@/cms/schemaTypes';
import { MaxWidth } from '../MaxWidth';
import { SanityCtaLink } from '../SanityCtaLink';

function OakP(props: (typeof _OakP)['props']) {
  return <_OakP {...props} $mv="all-spacing-6" $color="black" />;
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
}) {
  const data = transformContentBlocks(documentationData);
  const usingTheAPI = transformUsingTheAPI(documentationData);
  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Navigation />
      <MaxWidth
        $ph="inner-padding-m"
        $flexDirection={'column'}
        $pv="inner-padding-xl6"
        $gap="all-spacing-16"
        $color={'black'}
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

function UsingTheAPI({ title, image, link, blocks }: UsingTheApiSection) {
  return (
    <OakFlex
      $alignItems="center"
      $flexDirection={['column', 'row']}
      $gap="all-spacing-16"
    >
      <OakFlex
        $flexGrow={1}
        $flexDirection="column"
        $gap={['all-spacing-6', 'all-spacing-7']}
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
              $height={['all-spacing-20', 'all-spacing-21']}
              $width={['all-spacing-20', 'all-spacing-21']}
            />
          )}
        </OakBox>
      </OakFlex>
      <OakFlex
        $flexDirection="column"
        $gap={['all-spacing-6', 'all-spacing-9']}
        $alignSelf="baseline"
      >
        {blocks.map((block, index) => (
          <OakFlex
            key={index}
            $flexGrow={1}
            $flexDirection="column"
            $gap={['all-spacing-6', 'all-spacing-7']}
            $pa={['all-spacing-6', 'all-spacing-7']}
            $background="mint30"
          >
            <BlockHeading tag="h2" $font={['heading-5', 'heading-4']}>
              {block.title}
            </BlockHeading>
            <OakFlex $gap={['all-spacing-4']} $flexDirection="column">
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
}) {
  const flexDirection = align === 'left' ? 'row' : 'row-reverse';

  return (
    <OakFlex
      $alignItems="center"
      $flexDirection={['column', flexDirection]}
      $gap="all-spacing-16"
    >
      <OakFlex
        $flexGrow={1}
        $flexDirection="column"
        $gap={['all-spacing-6', 'all-spacing-7']}
      >
        <BlockHeading tag="h1" $font={['heading-4', 'heading-3', 'heading-2']}>
          {title}
        </BlockHeading>
        <OakFlex $gap={['all-spacing-4']} $flexDirection="column">
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
            $height={['all-spacing-20', 'all-spacing-21']}
            $width={['all-spacing-20', 'all-spacing-21']}
          />
        </OakFlex>
      )}
    </OakFlex>
  );
}
