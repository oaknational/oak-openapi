'use client';

import {
  OakMaxWidth,
  OakBox,
  OakFlex,
  OakGrid,
  OakGridArea,
  OakHandDrawnHR,
  OakHeading,
  OakIcon,
  OakLI,
  OakLink,
  OakP,
  OakTypography,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import { footerSections } from '@/lib/footerSections';
import SocialButtons, { OAK_SOCIALS } from './SocialButtons';
import Logo from './Logo';
import Svg from './StyledSvg';

const TopOakHandDrawnHR = styled(OakHandDrawnHR)`
  position: relative;
  z-index: 10;
  height: 0.25rem;
`;

const LoopSvg = styled(Svg)`
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  width: 100%;
  height: 100%;
  color: rgb(190, 242, 189);
  transform: translate(25%, 15%) rotate(-10deg);
`;

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
    <>
      <OakBox
        $overflow={'hidden'}
        $background="white"
        $color="text-primary"
        $position={'relative'}
      >
        <TopOakHandDrawnHR $height="all-spacing-1" />
        <nav>
          <LoopSvg name="looping-line-3" />

          <OakMaxWidth
            $pt={['inner-padding-m', 'inner-padding-xl6']}
            $justifyContent={'center'}
            $flexDirection={'column'}
            $position={'relative'}
            $width={'100%'}
            $ma="auto"
            $ph={'inner-padding-m'}
            $pv="inner-padding-xl6"
            // FIXME: styles are being overwritten somewhere so having
            // to declare this.
            $mh={'auto'}
            $maxWidth={['all-spacing-21', 'all-spacing-24']}
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
                socialNetworks={OAK_SOCIALS}
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
    </>
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
