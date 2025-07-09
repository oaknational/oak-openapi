'use client';
import Footer from '@/components/Footer';
import Head from 'next/head';
import { Navigation } from '@/components/Nav';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakImage,
  OakPrimaryButton,
  OakSecondaryButton,
  OakP as _OakP,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import {
  transformContentBlocks,
  transformUsingTheAPI,
  UsingTheApiSection,
} from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import { CurriculumApiLandingPage } from '@/cms/schemaTypes';
import { MaxWidth } from '../MaxWidth';

function OakP(props: (typeof _OakP)['props']) {
  return <_OakP {...props} $mv="all-spacing-6" />;
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
        {link && (
          <OakPrimaryButton
            isTrailingIcon={true}
            iconName="send"
            element="a"
            href={link.href}
          >
            {link.text}
          </OakPrimaryButton>
        )}
        <OakBox>
          {image && (
            <OakImage
              sizes={`width: ${343}px, height: ${288}px`}
              src={image.src}
              alt=""
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
            <OakBox>
              {typeof block.description === 'string' ? (
                <OakP>{block.description}</OakP>
              ) : (
                block.description
              )}
            </OakBox>
            {block.link && (
              <OakSecondaryButton
                isTrailingIcon={true}
                iconName="arrow-right"
                element="a"
                href={block.link.href}
              >
                {block.link.text}
              </OakSecondaryButton>
            )}
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
  link?: { text: string; href: string };
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
        <OakBox>
          {typeof description === 'string' ? (
            <OakP>{description}</OakP>
          ) : (
            description
          )}
        </OakBox>
        {/* links are styled as SecondaryButtons */}
        {link && (
          <OakSecondaryButton
            isTrailingIcon={true}
            iconName="arrow-right"
            element="a"
            href={link.href}
          >
            {link.text}
          </OakSecondaryButton>
        )}
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
