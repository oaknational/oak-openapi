'use client';
import { OakFlex, OakLink, OakHeading } from '@oaknational/oak-components';
import styled from 'styled-components';

import Logo from '@/components/Logo';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    color: black;
    display: flex;
  }
`;

export default function Banner() {
  return (
    <OakFlex
      as="header"
      $alignItems={'center'}
      $gap={'all-spacing-10'}
      $pv="inner-padding-s"
      $ph="inner-padding-m"
      $bb={'border-solid-m'}
    >
      <OakLinkLogo
        aria-label="Oak National Academy"
        href="https://www.thenational.academy/"
      >
        <Logo width="104" height="48" />
      </OakLinkLogo>
      <OakHeading ariaHidden tag="h1" $font="heading-6">
        Oak OpenAPI
      </OakHeading>
    </OakFlex>
  );
}
