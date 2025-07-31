'use client';

import Head from 'next/head';
import { Navigation } from '../Nav';
import { MaxWidth } from '../MaxWidth';
import Footer from '../Footer';
import {
  OakBox,
  OakGrid,
  OakHeading,
  OakImage,
  OakP,
} from '@oaknational/oak-components';

export default function Page() {
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
        <OakGrid
          $pv="inner-padding-xl4"
          $ph="inner-padding-xl6"
          $background="mint"
          $cg="space-between-xxxl"
          $gridTemplateColumns="1fr 1fr"
        >
          <OakBox>
            <OakHeading $mv="space-between-m" tag="h2" $font="heading-2">
              Bulk Download
            </OakHeading>
            <OakP $mb="space-between-m">
              Oak’s lesson and curriculum text-based data is provided as a
              single JSON for each national curriculum subject and educational
              phase.
            </OakP>
          </OakBox>
          <OakBox>
            <OakImage
              sizes="width: 2228px, height: 1472px"
              priority={true}
              src={{
                src: '/images/bulk-hero.png',
                width: 2228,
                height: 1472,
              }}
              alt=""
              $height="all-spacing-20"
            />
          </OakBox>
        </OakGrid>
      </MaxWidth>
      <Footer />
    </>
  );
}
