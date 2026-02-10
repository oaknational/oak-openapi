'use client';
import {
  OakBox,
  OakFlex,
  OakHeading,
  OakIcon,
  OakLI,
  OakLink,
  OakP,
  OakHandDrawnHR,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import React from 'react';
import { footerSections } from '@/lib/footerSections';
import SocialButtons, { OAK_SOCIALS } from './SocialButtons';
import Logo from './Logo';
import { StrongLinkNoUnderline } from './StrongSecondaryLink';
import IconFeedback from './IconFeedback';
import { MaxWidth } from './MaxWidth';
import { GetUpdates } from './landingPage/GetUpdates';

export interface HubspotPayload {
  fields: {
    name: string;
    value: string | undefined;
  }[];
  context: {
    pageUri: string;
    pageName: string;
    hutk?: string | undefined;
  };
}

const TopOakHandDrawnHR = styled(OakHandDrawnHR)`
  position: relative;
  z-index: 10;
  height: 0.25rem;
`;

const FlexedBox = styled(OakBox)`
  flex: 1;
`;

// const LoopSvg = styled(Svg)`
//   position: absolute;
//   top: 0;
//   right: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   color: rgb(190, 242, 189);
//   transform: translate(25%, 15%) rotate(-10deg);
// `;

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
`;

const FooterOakLink = styled(OakLink)`
  color: inherit;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
    color: inherit;
  }

  &:visited {
    color: inherit;
    text-decoration: underline;
  }
`;

export default function Footer(): React.ReactElement {
  return (
    <footer>
      <TopOakHandDrawnHR $height="spacing-4" />
      <OakBox $background="bg-decorative1-very-subdued">
        <MaxWidth
          $flexDirection={['column', 'row']}
          $pv="spacing-56"
          $ph="spacing-16"
          $gap={['spacing-56', 'spacing-24', 'spacing-80']}
        >
          <ContactUs />
          <GiveFeedback />
          <GetUpdates />
        </MaxWidth>
      </OakBox>
      <OakBox
        $overflow={'hidden'}
        $background="bg-primary"
        $color="text-primary"
        $position={'relative'}
      >
        <MaxWidth
          as="nav"
          $justifyContent={'center'}
          $flexDirection={['column', 'column', 'row-reverse']}
          $gap="spacing-48"
          $pv={['spacing-56', 'spacing-48', 'spacing-80']}
          $ph={'spacing-16'}
          $ma={'auto'}
          $position={'relative'}
          $width={'100%'}
        >
          <OakFlex
            $flexDirection={['column', 'row']}
            $gap={['spacing-48', 'spacing-16']}
          >
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.pupils as FooterSectionLinksProps)}
              />
            </OakBox>
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.oak as FooterSectionLinksProps)}
              />
            </OakBox>
            <OakBox style={{ flex: '1' }} $minWidth="240px">
              <FooterSectionLinks
                {...(footerSections.legal as FooterSectionLinksProps)}
              />
            </OakBox>
          </OakFlex>
          <OakFlex
            $mb="spacing-56"
            $width={'100%'}
            $flexDirection={['column', 'row']}
            $pt={['spacing-12', 'spacing-0']}
          >
            <OakFlex $flexDirection="column" $gap="spacing-48">
              <OakLinkLogo href="https://www.thenational.academy/">
                <Logo name="logo-with-text" width="165" height="75" />
              </OakLinkLogo>

              <OakFlex $flexDirection={'column'} $gap="spacing-24">
                <SocialButtons
                  $display={['flex']}
                  for="Oak National Academy"
                  socialNetworks={OAK_SOCIALS}
                />

                <OakBox>
                  <OakP $font={'body-3-bold'} $mb="spacing-16">
                    © Oak National Academy Limited, No 14174888
                  </OakP>
                  <OakP $font={['body-4']}>
                    1 Scott Place, 2 Hardman Street, Manchester, M3 3AA
                  </OakP>
                </OakBox>
              </OakFlex>
            </OakFlex>
          </OakFlex>
        </MaxWidth>
      </OakBox>
    </footer>
  );
}

interface FooterLink {
  text: string;
  href?: string;
  type?: 'page';
  icon?: 'external';
  ariaLabel?: string;
}

interface FooterSectionLinksProps {
  title: string;
  links: FooterLink[];
}

const FooterSectionLinks = ({
  title,
  links,
}: FooterSectionLinksProps): React.ReactElement => {
  // $mt={['space-between-m2', 'space-between-none']}
  // $mb="space-between-ssx"
  return (
    <OakFlex $flexDirection="column" $gap="spacing-24">
      <OakHeading $font="heading-7" $color="text-primary" tag="h2">
        {title}
      </OakHeading>
      <OakFlex
        $color={'text-primary'}
        $font={'body-2'}
        as="ul"
        role="list"
        $flexDirection="column"
        $gap="spacing-24"
      >
        {links.map((link) => (
          <OakLI key={link.text}>
            <FooterLink {...link} />
          </OakLI>
        ))}
      </OakFlex>
    </OakFlex>
  );
};

const FooterLink = ({
  text,
  href,
  ariaLabel,
  icon,
}: FooterLink): React.ReactElement => {
  return (
    <OakFlex $gap={'spacing-8'} $display={'inline-flex'} $alignItems="center">
      <FooterOakLink
        target={icon ? '_blank' : null}
        href={href}
        {...{ 'aria-label': ariaLabel ?? undefined }}
      >
        {text}
      </FooterOakLink>
      {icon && <OakIcon $height="spacing-24" iconName={icon} />}
    </OakFlex>
  );
};

function ContactUs(): React.ReactElement {
  return (
    <FlexedBox $color="text-primary">
      <OakFlex as="h2" $font="heading-5" $gap="spacing-8">
        <OakIcon iconName="send" />
        Contact us
      </OakFlex>
      <OakP $mt="spacing-8">
        If you need help with using the API, get in touch.
      </OakP>
      <OakBox $mt="spacing-24">
        <StrongLinkNoUnderline
          iconName="arrow-right"
          href="mailto:help@thenational.academy"
          isTrailingIcon={true}
        >
          Send us an email
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}

function GiveFeedback(): React.ReactElement {
  return (
    <FlexedBox $color="text-primary">
      <OakFlex as="h2" $font="heading-5" $gap="spacing-8">
        <IconFeedback />
        Give Feedback
      </OakFlex>
      <OakP $mt="spacing-8">
        Our API is new, we&apos;d love to hear your feedback to help us improve.
      </OakP>
      <OakBox $mt="spacing-24">
        <StrongLinkNoUnderline
          iconName="arrow-right"
          href="https://survey.hsforms.com/1C1LX6MhoTWi2_3iF6Q6y3gbvumd"
          isTrailingIcon
        >
          Give feedback
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}
