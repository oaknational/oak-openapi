import styled from 'styled-components';
import { OakAPINavigationLink as _OakAPINavigationLink } from './OakAPINavigationLink';
import {
  OakFlex,
  OakSpan,
  OakHeading,
  OakLink,
  OakModal,
  OakSecondaryButton,
} from '@oaknational/oak-components';

import Logo from '~/components/Logo';
import { useState } from 'react';
import { MaxWidth } from './MaxWidth';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    display: flex;
  }
`;

const MenuSeparator = styled.hr`
  background: #cacaca;
  height: 1px;
  width: 235px;
  margin: 0;
  border: 0;
`;

const MenuContainer = styled(OakFlex)`
  .menu-contents-wide {
    display: none;
  }

  @media (min-width: 1280px) {
    .menu-contents-wide {
      display: flex;
      flex: 1;
    }

    .menu-contents {
      display: none;
    }
  }
`;

// this is silly, but I don't have access to InternalShadowRoundButton
// so it's necessary to hide the text and remove the padding
const SecondaryButtonWithoutText = styled(OakSecondaryButton)`
  div > span {
    display: none;
  }
`;

export function Navigation() {
  return (
    <MenuContainer $bb={'border-solid-s'} $borderColor="grey40">
      <MaxWidth
        as="header"
        $alignItems={'center'}
        $gap={'all-spacing-9'}
        $pv="inner-padding-s"
        $ph="inner-padding-m"
        $color="text-primary"
        $flexDirection={'row'}
      >
        <OakFlex role="list" $gap="space-between-m2" $alignItems="center">
          <OakFlex $alignItems="center" $gap="space-between-s">
            <OakLinkLogo href="https://www.thenational.academy/">
              <Logo width="31" height="42" />
            </OakLinkLogo>
            <OakHeading tag="span" $font="heading-6">
              Oak Curriculum API
            </OakHeading>
          </OakFlex>
        </OakFlex>

        <MenuContents className="menu-contents-wide" wide={true} />
        <Menu className="menu-contents">
          <MenuContents wide={false} />
        </Menu>
      </MaxWidth>
    </MenuContainer>
  );
}

function OakAPINavigationLink({ $font = 'heading-light-7', ...props }) {
  const children = props.children;

  // this is a workaround because the font can't be passed directly to links… apparently
  return (
    <_OakAPINavigationLink {...props}>
      <OakSpan $font={$font}>{children}</OakSpan>
    </_OakAPINavigationLink>
  );
}

const MenuModal = styled(OakModal)`
  width: 375px;

  ${_OakAPINavigationLink} {
    width: fit-content;

    &.selected::after {
      display: none;
    }

    &.selected:hover {
      text-decoration: underline;
    }
  }
`;

function Menu({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <OakFlex $flexGrow="1" $justifyContent="end" className={className}>
      <SecondaryButtonWithoutText
        isTrailingIcon={true}
        style={{ padding: 0, border: 0 }}
        onClick={() => setIsOpen(true)}
        iconName="hamburger"
      />

      <MenuModal
        isOpen={isOpen}
        isLeftHandSide={false}
        footerSlot={null}
        onClose={() => setIsOpen(false)}
      >
        <OakFlex
          as="nav"
          $gap="space-between-l"
          $pa="all-spacing-4"
          $flexDirection="column"
          $flexGrow="1"
        >
          {children}
        </OakFlex>
      </MenuModal>
    </OakFlex>
  );
}

function MenuContents({
  wide,
  className,
}: {
  wide: boolean;
  className?: string;
}) {
  const flexDirection = wide ? 'row' : 'column';
  return (
    <OakFlex
      $gap="space-between-m2"
      $flexDirection={flexDirection}
      className={className}
      $justifyContent="space-between"
    >
      <OakFlex
        role="list"
        $gap="space-between-m2"
        $flexDirection={flexDirection}
      >
        <OakAPINavigationLink role="listitem" href="#" className="selected">
          Home
        </OakAPINavigationLink>
        <OakAPINavigationLink role="listitem" href="/docs">
          Documentation
        </OakAPINavigationLink>
      </OakFlex>
      {wide ? null : <MenuSeparator />}
      <OakFlex
        role="list"
        $gap="space-between-m2"
        $flexDirection={flexDirection}
      >
        <OakAPINavigationLink
          role="listitem"
          href="mailto:xxx@yyy.com"
          isTrailingIcon
          iconName="send"
        >
          Request an API key
        </OakAPINavigationLink>

        <OakAPINavigationLink
          role="listitem"
          href="/playground"
          isTrailingIcon
          iconName="external"
          target="_blank"
        >
          API playground
        </OakAPINavigationLink>

        <OakAPINavigationLink
          role="listitem"
          href="/bulk-downloads"
          isTrailingIcon
          iconName="external"
          target="_blank"
        >
          Bulk downloads
        </OakAPINavigationLink>
      </OakFlex>
    </OakFlex>
  );
}
