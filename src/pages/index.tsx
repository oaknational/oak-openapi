import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHeading,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakPrimaryButton,
  OakSecondaryButton,
  OakSpan,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import Feature from '~/components/Feature';
import List from '~/components/List';
import Logo from '~/components/Logo';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
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
      <OakLinkLogo href="https://www.thenational.academy/">
        <Logo width="104" height="48" />
      </OakLinkLogo>
      <OakHeading tag="h1" $font="heading-6">
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
              Lorem ipsum dolor sit amet consectetur adipisicing elit
            </OakHeading>
            <OakP $color="black" $font="body-1" data-testId="OakP-id">
              Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
              Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris
              nisi ut aliquip.
            </OakP>
            <OakFlex $gap={'all-spacing-4'}>
              <OakSecondaryButton element="a" href="/request-api-key">
                Request an API key
              </OakSecondaryButton>
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
              <img
                // FIXME
                src="/images/tmp-workers.png"
                style={{ height: 'fit-content', width: '100%' }}
                alt="placeholder"
                width={2228}
                height={1472}
                sizes="400px"
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
        <OakGrid $cg="space-between-m" $rg="space-between-m">
          <OakGridArea
            $colSpan={4}
            $pa="inner-padding-xl"
            $gap={'all-spacing-5'}>
            <OakHeading $font="heading-5" tag="h3">
              What can I expect?
            </OakHeading>
            <OakP $font="body-1">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Cupiditate, minima. Doloremque nesciunt deserunt quos nisi unde,
              eaque iste odio ex similique voluptatibus fugiat eius sed ut
              reiciendis rem dolor voluptates.
            </OakP>
            <List>
              <OakLI>List item 1</OakLI>
              <OakLI>List item 2</OakLI>
              <OakLI>List item 3</OakLI>
              <OakLI>List item 4</OakLI>
            </List>
          </OakGridArea>
          <OakGridArea
            $colSpan={8}
            $pa="inner-padding-xl"
            $gap={'all-spacing-10'}>
            <Feature
              title="How do I get started with Oak OpenAPI?"
              cta="Request an API key"
              ctaHref="/request-api-key">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Cupiditate, minima. Doloremque nesciunt deserunt quos nisi unde,
              eaque iste odio ex similique voluptatibus fugiat eius sed ut
              reiciendis rem dolor voluptates.
            </Feature>
            <Feature
              title="What are we offering?"
              cta="Visit OpenAPI playground"
              ctaHref="/playground">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Cupiditate, minima. Doloremque nesciunt deserunt quos nisi unde,
              eaque iste odio ex similique voluptatibus fugiat eius sed ut
              reiciendis rem dolor voluptates.
            </Feature>
            <Feature
              title="Help us make Oak OpenAPI better"
              cta="Give feedback here"
              ctaHref="/feedback">
              Lorem ipsum dolor sit amet consectetur adipisicing elit.
              Cupiditate, minima. Doloremque nesciunt deserunt quos nisi unde,
              eaque iste odio ex similique voluptatibus fugiat eius sed ut
              reiciendis rem dolor voluptates.
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
              How our OpenAPI works
            </OakHeading>
            <OakP>
              Lorem ipsum dolor, sit amet consectetur adipisicing elit. Suscipit
              nobis officia dicta eveniet aliquid? Consequuntur, vel sed harum
              cupiditate est voluptates itaque quasi, sapiente quos aspernatur
              nobis rem, quaerat distinctio?
            </OakP>
          </OakGridArea>
        </OakGrid>
      </OakMaxWidth>
    </OakBox>
  );
}
