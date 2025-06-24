import Footer from '@/components/Footer';
import Head from 'next/head';
import { Navigation } from '@/components/Nav';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakImage,
  OakMaxWidth,
  OakSecondaryButton,
  OakP as _OakP,
} from '@oaknational/oak-components';
import styled from 'styled-components';

function OakP(props: (typeof _OakP)['props']) {
  return <_OakP {...props} $mv="all-spacing-6" />;
}

// FIXME this should come from Sanity - unsure of structure for now
const data = [
  {
    title: (
      <>
        <em>Integrate</em> Oak&apos;s high-quality educational content into your
        service
      </>
    ),
    description: `We&apos;re offering a free API to share our high-quality educational content with the broader education community, all under the Open Government Licence.`,
    image: {
      src: '/images/api_1.png',
      width: 2228,
      height: 1472,
    },
  },
  {
    title: 'Why are we providing an API?',
    description: (
      <>
        <OakP>
          We&apos;re here to support great teaching. We work to improve pupil
          outcomes and close the disadvantage gap by supporting teachers to
          teach, and enabling pupils to access a high-quality curriculum.
        </OakP>
        <OakP>
          As part of this mission, we are providing an API to make our
          high-quality content available to the wider education market for free
          on the Open Government Licence. Whether you&apos;re an emerging EdTech
          start-up, an established learning tool, or a quiz-based gaming
          platform, you can use our content with assurance that it has been
          created in line with the latest pedagogical research and aligned with
          our curriculum design principles.
        </OakP>
      </>
    ),
    image: {
      src: '/images/api_2.png',
      width: 2228,
      height: 1472,
    },
    link: {
      text: 'API Overview',
      href: '/#api-overview',
    },
  },
  {
    title: 'What you can do with the API?',
    description:
      'Through the Oak Curriculum API, you will have access to a wide range of educational content across all subjects for key stages 1-4. Our aim is that the curriculum data and lessons resources in the Oak Curriculum API can be used flexibly within almost any product or service that would benefit teachers and pupils.',
    image: {
      src: '/images/api_3.png',
      width: 2228,
      height: 1472,
    },
    link: {
      text: 'See Examples',
      href: '/#examples',
    },
  },
];

const BlockHeading = styled(OakHeading)`
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
        $flexDirection={'column'}
        $pv="inner-padding-xl6"
        $gap="all-spacing-16"
      >
        <BlockAndText1
          title={data[0].title}
          description={data[0].description}
          image={data[0].image}
        />
        <BlockAndText1
          title={data[1].title}
          description={data[1].description}
          image={data[1].image}
          link={data[1].link}
          align="right"
        />
        <BlockAndText1
          title={data[2].title}
          description={data[2].description}
          image={data[2].image}
          link={data[2].link}
          align="right"
        />
      </OakMaxWidth>
      <Footer />
    </>
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
  image: { src: string; width: number; height: number };
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
      <OakFlex $flexGrow={1} $background="transparent">
        <OakImage
          sizes={`width: ${image.width}px, height: ${image.height}px`}
          src={image}
          alt=""
          $height={['all-spacing-20', 'all-spacing-21']}
          $width={['all-spacing-20', 'all-spacing-21']}
        />
      </OakFlex>
    </OakFlex>
  );
}
