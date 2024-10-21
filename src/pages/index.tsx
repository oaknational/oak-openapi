import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakImage,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakOL,
  OakOutlineAccordion,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
  OakTertiaryButton,
  OakUL,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import Feature from '~/components/Feature';

import Logo from '~/components/Logo';

import Footer from '~/components/Footer';
import Head from 'next/head';

import { Nav } from '~/components/Nav';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
`;

const AlignFixButton = styled(OakSecondaryButton)`
  a {
    display: inline-flex;

    align-items: center;
    font-size: 2rem;
  }
`;

const OakLiLink = styled(OakLink)`
  text-indent: initial;
`;

const navItems = [
  { title: 'About our open API', href: '#about-api' },
  { title: 'How to get started', href: '#get-started' },
  { title: 'What we offer', href: '#what-we-offer' },
  { title: `What’s available`, href: `#whats-available` },
  { title: 'FAQs', href: '#faqs' },
  { title: 'Give feedback', href: '#give-feedback' },
];

export default function Page() {
  return (
    <>
      <Head>
        <title>Oak OpenAPI - Oak National Academy</title>
      </Head>
      <Banner />
      <Hero />
      <Features />
      <Footer />
    </>
  );
}

function Banner() {
  return (
    <OakFlex
      as="header"
      $alignItems={'center'}
      $gap={'all-spacing-10'}
      $pv="inner-padding-s"
      $ph="inner-padding-m"
      $bb={'border-solid-m'}
      $color="text-primary">
      <OakLinkLogo
        aria-label="Oak National Academy"
        href="https://www.thenational.academy/">
        <Logo width="104" height="48" />
      </OakLinkLogo>
      <OakHeading ariaHidden tag="h1" $font="heading-6">
        Oak OpenAPI
      </OakHeading>
    </OakFlex>
  );
}

function Hero() {
  return (
    <OakBox $background="mint" $color="text-primary">
      <OakMaxWidth
        $ph="inner-padding-m"
        $flexDirection={'row'}
        $pv="inner-padding-xl6">
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea $colSpan={[12, 7]} $flexDirection={'column'}>
            <OakSpan
              style={{ width: 'fit-content' }}
              $background="mint110"
              $borderRadius="border-radius-xl"
              $pv="inner-padding-xs"
              $ph="inner-padding-s"
              $font={'body-3-bold'}>
              Beta
            </OakSpan>

            <OakHeading $mv={'space-between-m'} $font="heading-3" tag="h2">
              Leverage Oak&apos;s high-quality education content on your
              platform
            </OakHeading>

            <OakP $mb={'space-between-l'} $color="black" $font="body-2">
              We are providing a free API to make our high-quality education
              content available to the wider education market on the{' '}
              <OakLink
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank">
                Open Government Licence
              </OakLink>
              .
            </OakP>
            <OakFlex $gap={'all-spacing-4'}>
              <AlignFixButton
                element="a"
                href="mailto:help@thenational.academy?subject=Oak%20OpenAPI">
                Request an API key
              </AlignFixButton>

              <OakPrimaryButton
                element="a"
                href="/playground"
                isTrailingIcon={true}
                iconName="external">
                Visit OpenAPI playground
              </OakPrimaryButton>
            </OakFlex>
          </OakGridArea>
          <OakGridArea $display={['none', 'block']} $colSpan={[12, 5]}>
            <OakFlex>
              <OakImage
                sizes="width: 2228px, height: 1472px"
                priority={true}
                src={{ src: '/images/workers.png', width: 2228, height: 1472 }}
                alt=""
                $height="all-spacing-20"
              />
            </OakFlex>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}
function Features() {
  return (
    <OakBox $width="100%" $background="white" $color="text-primary">
      <OakMaxWidth
        $ph="inner-padding-m"
        $flexDirection={'row'}
        $pv={['inner-padding-xl2', 'inner-padding-xl6']}>
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea
            $colSpan={[12, 4]}
            $alignSelf={'start'}
            $position={['static', 'sticky', 'sticky']}
            $top={'all-spacing-10'}
            $display={['none', 'block', 'block']}>
            <Nav anchorTarget="#open-api-contents" items={navItems} />
          </OakGridArea>
          <OakGridArea
            $colSpan={[12]}
            $position={['static', 'static', 'sticky']}
            $display={['block', 'none', 'none']}
            $background="grey20"
            $pa="inner-padding-m">
            <OakBox $position="relative">
              <Nav anchorTarget="open-api-contents" items={navItems} />
            </OakBox>
          </OakGridArea>

          <OakGridArea
            $width={'100%'}
            $colSpan={[12, 7]}
            $gap={'all-spacing-9'}>
            <Feature
              anchorTarget="about-api"
              title="Why is Oak providing an API?">
              <OakP $font={'body-2'}>
                Oak National Academy&apos;s mission is to improve pupil outcomes
                and close the disadvantage gap by supporting teachers to teach,
                and pupils to access a high-quality curriculum.
              </OakP>
              <OakP $font={'body-2'}>
                As part of this mission, we are providing an API to make our
                high-quality content available to the wider education market for
                free on the{' '}
                <OakLink
                  href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                  target="_blank">
                  Open Government Licence
                </OakLink>
                . Whether you&apos;re an emerging EdTech start-up, an
                established learning tool, or a quiz-based gaming platform, you
                can use our content with assurance that it has been created
                adhering to the latest in pedagogical research and aligning with
                our{' '}
                <OakLink
                  href="https://www.thenational.academy/blog/our-approach-to-curriculum"
                  target="_blank">
                  curriculum design principles
                </OakLink>
                .
              </OakP>
            </Feature>

            <Feature
              variant="mint"
              anchorTarget="get-started"
              title="How to get started">
              <OakOL>
                <OakLI $font={'body-2'}>
                  <strong>Sign up</strong>
                </OakLI>
                <OakP $mb="space-between-s">
                  <OakLiLink href="mailto:help@thenational.academy?subject=Oak%20OpenAPI">
                    Request an API key here
                  </OakLiLink>
                  <OakSpan $ma="auto">
                    , or get in touch with us by sending an email to{' '}
                  </OakSpan>
                  <OakLink href="mailto:help@thenational.academy?subject=Oak%20OpenAPI">
                    help@thenational.academy
                  </OakLink>
                  , and we&apos;ll set you up with an API key.
                </OakP>
                <OakLI $mt="space-between-m2" $font={'body-2'}>
                  <strong>Explore</strong>
                </OakLI>
                <OakP $mb="space-between-s">
                  Use our{' '}
                  <OakLink href="/playground">
                    interactive developer documentation
                  </OakLink>{' '}
                  to explore the different endpoints and which resources are
                  most appropriate for your use case.
                </OakP>
                <OakLI $font={'body-2'}>
                  <strong>Support</strong>
                </OakLI>
                <OakP>
                  If you need any help with your set-up or use case, please
                  don&apos;t hesitate to{' '}
                  <OakLink href="mailto:help@thenational.academy?subject=Oak%20OpenAPI">
                    contact us
                  </OakLink>
                  . We&apos;ll be happy to support you.
                </OakP>
              </OakOL>
            </Feature>

            <Feature anchorTarget="what-we-offer" title="What we offer">
              <OakUL>
                <OakLI $mb="space-between-xs" $font={'body-2'}>
                  <strong>Fully resourced curricula</strong>: we are developing
                  our resources across the full National Curriculum, and have
                  content available across multiple subjects and key stages,
                  ensuring that you have the materials you need to support a
                  wide range of learning requirements.
                </OakLI>
                <OakLI $mb="space-between-xs" $font={'body-2'}>
                  <strong>High-quality resources</strong>: Benefit from
                  meticulously crafted lessons by our expert curriculum
                  partners, all aligned to Oak&apos;s research-based curriculum
                  design principles. Our resources are designed to engage
                  students and support effective teaching and learning.
                </OakLI>
                <OakLI $mb="space-between-xs" $font={'body-2'}>
                  <strong>Flexible integration</strong>: Our API is designed to
                  be flexible and easy to integrate into your existing systems.
                  If you&apos;re looking for an endpoint providing our data in a
                  format you can&apos;t see, let us know and we&apos;ll explore
                  solutions for you.
                </OakLI>
              </OakUL>
            </Feature>
            <Feature
              anchorTarget="whats-available"
              title="What data is available">
              <OakP $font="body-2">
                Access fully resourced lessons across the National Curriculum,
                meticulously crafted by our expert curriculum partners, each
                including:
              </OakP>
              <OakUL>
                <OakLI $mb={'space-between-ssx'} $font={'body-2'}>
                  Teacher-led lesson videos
                </OakLI>
                <OakLI $mb={'space-between-ssx'} $font={'body-2'}>
                  Oak formatted slide decks
                </OakLI>
                <OakLI $mb={'space-between-ssx'} $font={'body-2'}>
                  Starter and exit quizzes
                </OakLI>
                <OakLI $mb={'space-between-ssx'} $font={'body-2'}>
                  Worksheets
                </OakLI>
                <OakLI $mb={'space-between-ssx'} $font={'body-2'}>
                  Interactive activities
                </OakLI>
              </OakUL>

              {/** @todo add link to PDF below  */}
              <OakTertiaryButton isTrailingIcon iconName="arrow-right">
                Download data overview (PDF)
              </OakTertiaryButton>
            </Feature>
            <Feature anchorTarget="faqs" title="FAQs">
              <OakOutlineAccordion header="Question 1 TBC" id="accordion-1">
                <OakBox $pt="inner-padding-l">
                  <OakP $font="body-2">Answer 1 TBC</OakP>
                </OakBox>
              </OakOutlineAccordion>
              <OakOutlineAccordion header="Question 2 TBC" id="accordion-1">
                <OakBox $pt="inner-padding-l">
                  <OakP $font="body-2">Answer 2 TBC</OakP>
                </OakBox>
              </OakOutlineAccordion>
              <OakOutlineAccordion header="Question 3 TBC" id="accordion-1">
                <OakBox $pt="inner-padding-l">
                  <OakP $font="body-2">Answer 3 TBC</OakP>
                </OakBox>
              </OakOutlineAccordion>
              <OakOutlineAccordion header="Question 4 TBC" id="accordion-1">
                <OakBox $pt="inner-padding-l">
                  <OakP $font="body-2">Answer 4 TBC</OakP>
                </OakBox>
              </OakOutlineAccordion>

              <OakSpan>
                If you need more help{' '}
                <OakLink href="mailto:help@thenational.academy?subject=Oak%20OpenAPI">
                  contact us here
                </OakLink>
              </OakSpan>
            </Feature>
            <Feature
              anchorTarget="give-feedback"
              title="Help us make Oak OpenAPI better">
              <OakP $font="body-2">
                Our API is new, and we strive to make it as accessible and
                suited to as many use cases as possible. It is designed to be
                flexible and easy to integrate into your existing systems. If
                you have feedback or are looking for an endpoint providing our
                content in a format you can&apos;t see, let us know, and
                we&apos;ll work with you to find a solution that works for you.
              </OakP>
              {/** @todo add link to give feedback */}
              <OakTertiaryButton isTrailingIcon iconName="arrow-right">
                Give feedback
              </OakTertiaryButton>
            </Feature>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}
