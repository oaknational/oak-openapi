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
import { footerSections } from '@/lib/footerSections';
import SocialButtons, { OAK_SOCIALS } from './SocialButtons';
import Logo from './Logo';
import { StrongLinkNoUnderline } from './StrongSecondaryLink';
import IconFeedback from './IconFeedback';
import { MaxWidth } from './MaxWidth';
import { GetUpdates } from './landingPage/GetUpdates';

export type HubspotPayload = {
  fields: {
    name: string;
    value: string | undefined;
  }[];
  context: {
    pageUri: string;
    pageName: string;
    hutk?: string | undefined;
  };
};

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

export default function Footer() {
  return (
    <footer>
      <TopOakHandDrawnHR $height="all-spacing-1" />
      <OakBox $background="mint30">
        <MaxWidth
          $flexDirection={['column', 'row']}
          $pv="inner-padding-xl5"
          $ph="inner-padding-m"
          $gap={['space-between-xl', 'space-between-m', 'space-between-xxxl']}
        >
          <ContactUs />
          <GiveFeedback />
          <GetUpdates />
        </MaxWidth>
      </OakBox>
      <OakBox
        $overflow={'hidden'}
        $background="white"
        $color="text-primary"
        $position={'relative'}
      >
        <MaxWidth
          as="nav"
          $justifyContent={'center'}
          $flexDirection={['column', 'column', 'row-reverse']}
          $gap="space-between-l"
          $pv={['inner-padding-xl5', 'inner-padding-xl4', 'inner-padding-xl8']}
          $ph={'inner-padding-m'}
          $ma={'auto'}
          $position={'relative'}
          $width={'100%'}
        >
          <OakFlex
            $flexDirection={['column', 'row']}
            $gap={['space-between-l', 'space-between-s']}
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
            $mb="space-between-xl"
            $width={'100%'}
            $flexDirection={['column', 'row']}
            $pt={['inner-padding-s', 'inner-padding-none']}
          >
            <OakFlex $flexDirection="column" $gap="space-between-l">
              <OakLinkLogo href="https://www.thenational.academy/">
                <Logo name="logo-with-text" width="165" height="75" />
              </OakLinkLogo>

              <OakFlex $flexDirection={'column'} $gap="space-between-m">
                <SocialButtons
                  $display={['flex']}
                  for="Oak National Academy"
                  socialNetworks={OAK_SOCIALS}
                />

                <OakBox>
                  <OakP $font={'body-3-bold'} $mb="space-between-s">
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

type FooterLink = {
  text: string;
  href?: string;
  type?: 'page';
  icon?: 'external';
  ariaLabel?: string;
};

type FooterSectionLinksProps = {
  title: string;
  links: FooterLink[];
};

const FooterSectionLinks = ({ title, links }: FooterSectionLinksProps) => {
  // $mt={['space-between-m2', 'space-between-none']}
  // $mb="space-between-ssx"
  return (
    <OakFlex $flexDirection="column" $gap="space-between-m">
      <OakHeading $font="heading-7" $color="black" tag="h2">
        {title}
      </OakHeading>

      <OakFlex
        $color={'black'}
        $font={'body-2'}
        as="ul"
        role="list"
        $flexDirection="column"
        $gap="space-between-m"
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

const FooterLink = ({ text, href, ariaLabel, icon }: FooterLink) => {
  return (
    <OakFlex
      $gap={'all-spacing-2'}
      $display={'inline-flex'}
      $alignItems="center"
    >
      <FooterOakLink
        target={icon ? '_blank' : null}
        href={href}
        {...{ 'aria-label': ariaLabel ?? undefined }}
      >
        {text}
      </FooterOakLink>
      {icon && <OakIcon $height="all-spacing-6" iconName={icon} />}
    </OakFlex>
  );
};

function ContactUs() {
  return (
    <FlexedBox $color="black">
      <OakFlex as="h2" $font="heading-5" $gap="all-spacing-2">
        <OakIcon iconName="send" />
        Contact us
      </OakFlex>
      <OakP $mt="space-between-ssx">
        If you need help with using the API, get in touch.
      </OakP>
      <OakBox $mt="space-between-m">
        <StrongLinkNoUnderline
          iconName="arrow-right"
          href="/"
          isTrailingIcon={true}
        >
          Send us an email
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}

function GiveFeedback() {
  return (
    <FlexedBox $color="black">
      <OakFlex as="h2" $font="heading-5" $gap="all-spacing-2">
        <IconFeedback />
        Give Feedback
      </OakFlex>
      <OakP $mt="space-between-ssx">
        Our API is new, we&apos;d love to hear your feedback to help us improve.
      </OakP>
      <OakBox $mt="space-between-m">
        <StrongLinkNoUnderline iconName="arrow-right" href="/" isTrailingIcon>
          Give feedback
        </StrongLinkNoUnderline>
      </OakBox>
    </FlexedBox>
  );
}
