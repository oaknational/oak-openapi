import styled from 'styled-components';
import { OakAPINavigationLink } from './OakAPINavigationLink';
import {
  OakFlex,
  OakHeading,
  OakIcon,
  OakLabel,
  OakLink,
  OakMaxWidth,
  OakModal,
} from '@oaknational/oak-components';
import Logo from '~/components/Logo';

const OakLinkLogo = styled(OakLink)`
  margin: 0;
  padding: 0;

  span {
    display: flex;
  }
`;

const BurgerMenu = styled.div`
  label {
    cursor: pointer;
  }

  input,
  label {
    display: none;
  }

  @media (max-width: 1280px) {
    label {
      display: block;
    }

    nav {
      display: none;
    }

    input:checked + nav {
      display: flex;
      flex-direction: column;
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100vh;
      background-color: white;
      padding: 16px;
      justify-content: flex-start;

      & > div {
        flex-direction: column;

        > a {
          display: inline-block;
          width: fit-content;
        }
      }
    }
  }
`;

export function Navigation() {
  return (
    <OakFlex $bb={'border-solid-m'}>
      <OakMaxWidth
        as="header"
        $alignItems={'center'}
        $gap={'all-spacing-10'}
        $pv="inner-padding-s"
        $ph="inner-padding-m"
        $color="text-primary"
        $justifyContent="space-between"
        $flexDirection={'row'}
      >
        <OakFlex role="list" $gap="space-between-l" $alignItems="center">
          <OakFlex $alignItems="center" $gap="space-between-s">
            <OakLinkLogo
              aria-label="Oak National Academy"
              href="https://www.thenational.academy/"
            >
              <Logo width="31" height="42" />
            </OakLinkLogo>
            <OakHeading ariaHidden tag="h1" $font="heading-6">
              Oak Curriculum API
            </OakHeading>
          </OakFlex>
        </OakFlex>
        <Menu>
          <OakFlex role="list" $gap="space-between-m">
            <OakAPINavigationLink role="listitem" href="#" className="selected">
              Home
            </OakAPINavigationLink>
            <OakAPINavigationLink role="listitem" href="/docs">
              Documentation
            </OakAPINavigationLink>
          </OakFlex>
          <OakFlex role="list" $gap="space-between-m">
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
        </Menu>
      </OakMaxWidth>
    </OakFlex>
  );
}

function Menu({ children }: { children: React.ReactNode }) {
  return (
    <>
      <OakLabel htmlFor="show-menu">
        <OakIcon $colorFilter="black" alt="Show menu" iconName="hamburger" />
      </OakLabel>
      <input id="show-menu" className="show-menu" type="checkbox" />
      <OakModal
        isOpen={false}
        isLeftHandSide={false}
        footerSlot={null}
        onClose={() => {}}
      >
        <BurgerMenu>
          <OakFlex
            as="nav"
            $gap="space-between-l"
            $justifyContent="space-between"
            $flexGrow="1"
          >
            {children}
          </OakFlex>
        </BurgerMenu>
      </OakModal>
    </>
  );
}
