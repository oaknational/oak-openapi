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
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
  OakUL,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import Feature from '~/components/Feature';
import List from '~/components/List';
import Logo from '~/components/Logo';
import Tick from '~/components/Tick';
import Footer from '~/components/Footer';

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

/**
 * Notes:
 * - font currently defaulting to helvetica in oak-components
 */

export default function Page() {
  return (
    <>
      <Banner />
      <Hero />
      <Features />
      <HowItWorks />
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
      $bb={'border-solid-m'}>
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
    <OakBox $background="mint50">
      <OakMaxWidth $flexDirection={'row'} $pv={'inner-padding-xl6'}>
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea
            $colSpan={7}
            $pa="inner-padding-xl"
            $flexDirection={'column'}
            $gap={'all-spacing-6'}>
            <OakSpan
              style={{ width: 'fit-content' }}
              $background="mint110"
              $borderRadius="border-radius-xl"
              $pv="inner-padding-xs"
              $ph="inner-padding-s"
              $font={'body-3-bold'}>
              Beta
            </OakSpan>
            <OakHeading $font="heading-2" tag="h2">
              Oak OpenAPI
            </OakHeading>
            <OakHeading $font="heading-5" tag="h3">
              Use Oak&apos;s quality content on your platform
            </OakHeading>
            <OakP $color="black" $font="body-1">
              We are providing an API to make our high-quality education content
              available to the wider education market for free on the{' '}
              <OakLink
                href="https://www.nationalarchives.gov.uk/doc/open-government-licence/version/3/"
                target="_blank">
                Open Government Licence
              </OakLink>
              .
            </OakP>
            <OakFlex $gap={'all-spacing-4'}>
              <AlignFixButton element="a" href="/request-api-key">
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
          <OakGridArea $colSpan={5}>
            <OakFlex>
              <OakImage
                // FIXME
                src={{ src: '/images/workers.png', width: 2228, height: 1472 }}
                alt=""
                $height="all-spacing-20"
                // style={{ maxHeight: '400px' }}
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
    <OakBox $background="white">
      <OakMaxWidth $flexDirection={'row'} $pv={'inner-padding-xl6'}>
        <OakGrid
          $cg="space-between-m"
          $rg="space-between-m"
          $gridTemplateColumns={['1fr', 'repeat(12, 1fr)']}>
          <OakGridArea $colSpan={4} $gap={'all-spacing-5'}>
            <OakBox
              $background={'mint'}
              $borderRadius={'border-radius-m'}
              $pa="inner-padding-xl">
              <OakHeading $font="heading-5" tag="h3">
                How to get started:
              </OakHeading>
              <OakOL>
                <OakLI $font={'body-1'}>
                  <strong>Sign Up</strong>: Click the link above, or get in
                  touch with us by sending an email to{' '}
                  <OakLiLink href="mailto:xxx@thenational.academy">
                    xxx@thenational.academy
                  </OakLiLink>
                  , and we&apos;ll set you up with an API key.
                </OakLI>
                <OakLI $font={'body-1'}>
                  <strong>Explore</strong>: Use our{' '}
                  <OakLiLink href="/playground">
                    interactive developer documentation
                  </OakLiLink>{' '}
                  to explore the different endpoints and which resources are
                  most appropriate for your use case.
                </OakLI>
                <OakLI $font={'body-1'}>
                  <strong>Support</strong>: If you need any help with your
                  set-up or use case, please don&apos;t hesitate to contact us.
                  We&apos;ll be happy to support you.
                </OakLI>
              </OakOL>
            </OakBox>
          </OakGridArea>
          <OakGridArea
            $colSpan={8}
            $pa="inner-padding-xl"
            $gap={'all-spacing-10'}>
            <OakHeading $font="heading-5" tag="h2">
              Oak OpenAPI
            </OakHeading>
            <Feature title="Leverage Oak's high-quality education content on your platform">
              <OakP $font={'body-1'}>
                Oak National Academy&apos;s mission is to improve pupil outcomes
                and close the disadvantage gap by supporting teachers to teach,
                and pupils to access a high-quality curriculum.
              </OakP>
              <OakP $font={'body-1'}>
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
                  Curriculum Design Principles
                </OakLink>
                .
              </OakP>
            </Feature>
            <Feature title="What We Offer">
              <OakUL>
                <OakLI $font={'body-1'}>
                  <strong>Fully resourced curriculums</strong>: we are
                  developing our resources across the full National Curriculum,
                  and have content available across multiple subjects and key
                  stages, ensuring that you have the materials you need to
                  support a wide range of learning requirements.
                </OakLI>
                <OakLI $font={'body-1'}>
                  <strong>High-quality resources</strong>: Benefit from
                  meticulously crafted lessons by our expert curriculum
                  partners, all aligned to Oak&apos;s research-based curriculum
                  design principles. Our resources are designed to engage
                  students and support effective teaching and learning.
                </OakLI>
                <OakLI $font={'body-1'}>
                  <strong>Flexible integration</strong>: Our API is designed to
                  be flexible and easy to integrate into your existing systems.
                  If you&apos;re looking for an endpoint providing our data in a
                  format you can&apos;t see, let us know and we&apos;ll explore
                  solutions for you.
                </OakLI>
              </OakUL>
            </Feature>

            <Feature title="What's available?">
              <OakP $font="body-1">
                Access fully resourced lessons across the National Curriculum,
                meticulously crafted by our expert curriculum partners, each
                including:
              </OakP>
              <List>
                <OakLI $font={'body-1'}>
                  <Tick />
                  Teacher-led lesson videos
                </OakLI>
                <OakLI $font={'body-1'}>
                  <Tick />
                  Oak formatted slide decks
                </OakLI>
                <OakLI $font={'body-1'}>
                  <Tick />
                  Starter and exit quizzes
                </OakLI>
                <OakLI $font={'body-1'}>
                  <Tick />
                  Worksheets
                </OakLI>
                <OakLI $font={'body-1'}>
                  <Tick />
                  Interactive activities
                </OakLI>
              </List>
            </Feature>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}
function HowItWorks() {
  return (
    <OakBox $background="mint110">
      <OakMaxWidth $flexDirection={'row'} $pv={'inner-padding-xl6'}>
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea
            $colSpan={6}
            $pa="inner-padding-xl"
            $flexDirection={'column'}
            $gap={'all-spacing-6'}>
            <OakHeading $font="heading-5" tag="h3">
              Help us make Oak OpenAPI better
            </OakHeading>
            <OakP>
              Our API is new, and we strive to make it as accessible and suited
              to as many use cases as possible. It is designed to be flexible
              and easy to integrate into your existing systems. If you have
              feedback or are looking for an endpoint providing our content in a
              format you can&apos;t see, let us know, and we&apos;ll work with
              you to find a solution that works for you.
            </OakP>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}
