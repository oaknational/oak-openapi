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
        $maxHeight={'all-spacing-20'}
        $maxWidth={'all-spacing-20'}
        alt="Success illustration with checkmark"
        $height={['all-spacing-19', 'all-spacing-20', 'all-spacing-21']}
        $width={['all-spacing-19', 'all-spacing-20', 'all-spacing-21']}

      />
    </OakBox>
  );
}

// Success Content Component
function SuccessContent() {
  return (
    <OakFlex
      $maxWidth="all-spacing-22"
      $flexDirection="column"
      $gap="all-spacing-12"
      $ph={['all-spacing-4', 'all-spacing-0', "all-spacing-4"]}
      $mr={['all-spacing-0', 'all-spacing-0', "all-spacing-15"]}
    >
      <OakFlex $flexDirection="column" $gap="all-spacing-6">
        <OakHeading tag="h1" $font={["heading-3", "heading-2"]}>
          Thanks for downloading
        </OakHeading>
        <OakP $font="body-1" $maxWidth="all-spacing-21">
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
    <OakFlex $gap="all-spacing-4" $flexDirection={["column", "column", "row"]}>
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
        $pv="inner-padding-xl6"
        $gap="all-spacing-18"
        $color="black"
      >
        <OakFlex
          $alignItems="center"
          $gap={["all-spacing-4", "all-spacing-4", "all-spacing-15"]}
          $flexDirection={["column", "row"]}
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
