import {
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHandDrawnHR,
  OakHeading,
  OakIcon,
  OakJauntyAngleLabel as _OakJauntyAngleLabel,
  OakLI,
  OakLink,
  OakMaxWidth,
  OakP,
  OakSecondaryLink,
  OakTextInput as _OakTextInput,
  OakTypography,
  OakPrimaryButton,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import { footerSections } from '~/lib/footerSections';
import SocialButtons, { OAK_SOCIALS } from './SocialButtons';
import Logo from './Logo';

const TopOakHandDrawnHR = styled(OakHandDrawnHR)`
  position: relative;
  z-index: 10;
  height: 0.25rem;
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
      <OakFlex
        $background="mint30"
        $flexDirection="column"
        $pv="inner-padding-xl5"
        $ph="inner-padding-m"
        $gap="space-between-xl"
      >
        <ContactUs />
        <GiveFeedback />
        <GetUpdates />
      </OakFlex>
      <OakBox
        $overflow={'hidden'}
        $background="white"
        $color="text-primary"
        $position={'relative'}
      >
        <TopOakHandDrawnHR $height="all-spacing-1" />
        <nav>
          <OakMaxWidth
            // $pt={[16, 80]}
            $pt={['inner-padding-m', 'inner-padding-xl6']}
            $justifyContent={'center'}
            $flexDirection={'column'}
            $ph="inner-padding-l"
            $ma={'auto'}
            $position={'relative'}
            $width={'100%'}
          >
            <OakGrid>
              <OakGridArea $colSpan={[12, 3]}>
                <FooterSectionLinks
                  {...(footerSections.pupils as FooterSectionLinksProps)}
                />
                <OakBox $height="all-spacing-8" />
                <FooterSectionLinks
                  {...(footerSections.teachers as FooterSectionLinksProps)}
                />
              </OakGridArea>
              <OakGridArea $colSpan={[12, 3]}>
                <FooterSectionLinks
                  {...(footerSections.oak as FooterSectionLinksProps)}
                />
              </OakGridArea>
              <OakGridArea $colSpan={[12, 3]}>
                <FooterSectionLinks
                  {...(footerSections.legal as FooterSectionLinksProps)}
                />
              </OakGridArea>
              <OakGridArea $colSpan={[12, 3]}>
                <OakFlex
                  $justifyContent={['left', 'right']}
                  $mt={['space-between-m2', 'space-between-none']}
                >
                  <OakBox $ml={'space-between-none'} $display={['block']}>
                    <OakLinkLogo
                      aria-label="Oak National Academy"
                      href="https://www.thenational.academy/"
                    >
                      <Logo height="66" width="150" />
                    </OakLinkLogo>
                  </OakBox>
                </OakFlex>
              </OakGridArea>
            </OakGrid>
            <OakFlex
              $mb="space-between-xl"
              $mt={['space-between-m2', 'space-between-xl']}
              $width={'100%'}
              $justifyContent={['flex-start', 'space-between']}
              $flexDirection={['column', 'row']}
              $alignItems={['flex-start', 'center']}
              $pt={['inner-padding-s', 'inner-padding-none']}
            >
              <SocialButtons
                $display={['flex']}
                for="Oak National Academy"
                {...OAK_SOCIALS}
              />

              <OakFlex
                $mt={['space-between-m2', 'space-between-none']}
                $flexDirection={'column'}
              >
                <OakP $font={'body-3-bold'}>
                  © Oak National Academy Limited, No 14174888
                </OakP>
                <OakP $font={['body-4']}>
                  1 Scott Place, 2 Hardman Street, Manchester, M3 3AA
                </OakP>
              </OakFlex>
            </OakFlex>
          </OakMaxWidth>
        </nav>
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
  return (
    <OakFlex
      $flexDirection="column"
      $mt={['space-between-m2', 'space-between-none']}
    >
      <OakHeading
        $mb="space-between-ssx"
        $font="heading-7"
        $color="black"
        tag="h2"
      >
        {title}
      </OakHeading>
      <OakTypography $color={'black'} $font={'body-2'}>
        <ul role="list">
          {links.map((link) => (
            <OakLI key={link.text} $mt="space-between-xs">
              <FooterLink {...link} />
            </OakLI>
          ))}
        </ul>
      </OakTypography>
    </OakFlex>
  );
};

const FooterLink = ({ text, href, ariaLabel, icon }: FooterLink) => {
  return (
    <OakFlex $gap={'all-spacing-2'} $display={'inline-flex'}>
      <FooterOakLink
        target={icon ? '_blank' : null}
        href={href}
        {...{ 'aria-label': ariaLabel ?? undefined }}
      >
        {text}
      </FooterOakLink>
      {icon && <OakIcon iconName={icon} />}
    </OakFlex>
  );
};

function ContactUs() {
  return (
    <OakBox>
      <OakHeading as="h2" $font="heading-5" $color="black">
        Contact Us
      </OakHeading>
      <OakP $mt="space-between-ssx">
        If you need help with using the API, get in touch.
      </OakP>
      <OakP $mt="space-between-m">
        <strong>
          <StrongLinkNoUnderline iconName="arrow-right" href="#" isTrailingIcon>
            Send us an email
          </StrongLinkNoUnderline>
        </strong>
      </OakP>
    </OakBox>
  );
}

function GiveFeedback() {
  return (
    <OakBox>
      <OakHeading as="h2" $font="heading-5" $color="black">
        Give Feedback
      </OakHeading>
      <OakP $mt="space-between-ssx">
        Our API is new, we&apos;d love to hear your feedback to help us improve.
      </OakP>
      <OakP $mt="space-between-m">
        <strong>
          <StrongLinkNoUnderline iconName="arrow-right" href="#" isTrailingIcon>
            Give feedback
          </StrongLinkNoUnderline>
        </strong>
      </OakP>
    </OakBox>
  );
}

const OakJauntyAngleLabel = styled(_OakJauntyAngleLabel)`
  width: fit-content;
  background: #ffe555;
  border-radius: 0;
  z-index: 10;
  cursor: pointer;
  position: absolute;
  padding: 4px 8px;
  transform: rotate(-1.5deg) translateY(-15px) translateX(8px);
`;

const OakTextInput = styled(_OakTextInput)`
  padding: 16px 0;
  height: fit-content;
`;

function GetUpdates() {
  return (
    <OakBox>
      <OakHeading as="h2" $font="heading-5" $color="black">
        Receive updates
      </OakHeading>
      <OakP $mt="space-between-ssx" $mb="all-spacing-7">
        Sign up to our mailing list to receive important updates about the API.
      </OakP>
      <OakP $mt="space-between-m">
        {/* this isn't even a label :( */}
        <OakJauntyAngleLabel $background="lemon" htmlFor="email" as="label">
          <strong>Email address</strong>{' '}
          <span style={{ fontWeight: 400 }}>(required)</span>
        </OakJauntyAngleLabel>
        <OakTextInput
          id="email"
          type="email"
          $pa="inner-padding-m"
          placeholder="Email address"
        />
      </OakP>
      <OakP $mt="space-between-m">
        <OakPrimaryButton>Sign up for updates</OakPrimaryButton>
      </OakP>
    </OakBox>
  );
}

const StrongLinkNoUnderline = styled(OakSecondaryLink)`
  text-decoration: none;
  font-weight: 600;

  &:hover {
    text-decoration: underline;
  }

  &:visited {
    color: inherit;
  }
`;
