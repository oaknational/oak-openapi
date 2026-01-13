'use client';

import Head from 'next/head';
import { Navigation } from '@/components/Nav';
import { MaxWidth } from '@/components/MaxWidth';
import Footer from '@/components/Footer';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakImage,
  OakP,
  OakSecondaryButton,
  OakPrimaryButton,
} from '@oaknational/oak-components';

// Success Illustration Component
function SuccessIllustration() {
  return (
    <OakBox>
      <OakImage
        src={{
          src: '/images/bulk-success.svg',
          width: 416,
          height: 358,
        }}
        $maxHeight={'spacing-360'}
        $maxWidth={'spacing-360'}
        alt="Success illustration with checkmark"
        $height={['spacing-240', 'spacing-360', 'spacing-480']}
        $width={['spacing-240', 'spacing-360', 'spacing-480']}
      />
    </OakBox>
  );
}

// Success Content Component
function SuccessContent() {
  return (
    <OakFlex
      $maxWidth="spacing-640"
      $flexDirection="column"
      $gap="spacing-72"
      $ph={['spacing-16', 'spacing-0', 'spacing-16']}
      $mr={['spacing-0', 'spacing-0', 'spacing-100']}
    >
      <OakFlex $flexDirection="column" $gap="spacing-24">
        <OakHeading tag="h1" $font={['heading-3', 'heading-2']}>
          Thanks for downloading
        </OakHeading>
        <OakP $font="body-1" $maxWidth="spacing-480">
          We hope that the data is useful.
          <br />
          <br />
          Next, have a look at Oak's API documentation to help with integrating
          Oak's content into your product or service.
        </OakP>
      </OakFlex>
      <ActionButtons />
    </OakFlex>
  );
}

// Action Buttons Component
function ActionButtons() {
  return (
    <OakFlex $gap="spacing-16" $flexDirection={['column', 'column', 'row']}>
      <OakSecondaryButton
        element="a"
        href="/bulk-download"
        iconName="arrow-left"
        isTrailingIcon={false}
      >
        Back to downloads
      </OakSecondaryButton>
      <OakPrimaryButton
        element="a"
        href="/docs"
        iconName="arrow-right"
        isTrailingIcon={true}
      >
        Go to Oak's API documentation
      </OakPrimaryButton>
    </OakFlex>
  );
}

// Main Success Page Component
export default function BulkDownloadSuccessPage() {
  return (
    <>
      <Head>
        <title>Download Complete - Oak Curriculum API</title>
      </Head>
      <Navigation />
      <MaxWidth
        $flexDirection="column"
        $pv="spacing-64"
        $gap="spacing-180"
        $color="black"
      >
        <OakFlex
          $alignItems="center"
          $gap={['spacing-16', 'spacing-16', 'spacing-100']}
          $flexDirection={['column', 'row']}
          $justifyContent="space-between"
        >
          <SuccessIllustration />
          <SuccessContent />
        </OakFlex>
      </MaxWidth>
      <Footer />
    </>
  );
}
