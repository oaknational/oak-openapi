import Footer from '@/components/Footer';
import Head from 'next/head';
import { Navigation } from '@/components/Nav';
import {
  OakBox,
  OakFlex,
  OakImage,
  OakMaxWidth,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import Link from 'next/link';

const BlockHeading = styled.h2`
  em {
    display: inline-block;
    background-color: #bef2bd; /* FIXME: use oak token */
    padding: 0.1em 0.2em;
    text-decoration: none;
    font-style: normal;
  }
`;

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Navigation />
      <OakMaxWidth
        $ph="inner-padding-m"
        $flexDirection={'row'}
        $pv="inner-padding-xl6"
      >
        <BlockAndText></BlockAndText>
      </OakMaxWidth>
      <Footer />
    </>
  );
}

function BlockAndText() {
  return (
    <OakFlex>
      <OakBox>
        <BlockHeading>
          <em>Integrate</em> Oak&apos;s high-quality educational content into
          your service
        </BlockHeading>
        <p>
          We&apos;re offering a free API to share our high-quality educational
          content with the broader education community, all under the Open
          Government Licence.
        </p>
        <p>
          For more information, please refer to the{' '}
          <Link href="/docs">documentation</Link>
        </p>
      </OakBox>
      <OakBox>
        <OakImage
          sizes="width: 2228px, height: 1472px"
          src={{ src: '/images/api_1.png', width: 2228, height: 1472 }}
          alt=""
          $height="all-spacing-20"
        ></OakImage>
      </OakBox>
    </OakFlex>
  );
}
