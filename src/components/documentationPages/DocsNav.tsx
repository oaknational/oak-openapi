'use client';
import {
  OakLI,
  OakUL,
  OakAnchorTarget,
  OakLink,
  OakHeading,
  OakFlex,
  OakBox,
  OakSecondaryButton,
} from '@oaknational/oak-components';
import styled from 'styled-components';

import { CurriculumApiDocsNav } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';
import { useState } from 'react';
import { JauntyAngleLabel } from '../JauntyAngleLabel';

export type NavProps = {
  title?: string;
  location: string;
  items: CurriculumApiDocsNav;
  ariaLabel?: string;
  anchorTarget?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

const StyledOakLink = styled(OakLink)`
  color: #222222;
  text-decoration: none;
  margin: 0;
  padding: 0;

  &:visited,
  &:hover,
  &:visited:hover {
    color: #222222;
  }
`;

const StyledULItem = styled(OakLI)`
  color: #222222;
  flex-direction: column;

  a:hover {
    text-decoration: underline;
  }
`;

const createNavItem = (
  title: string,
  slug: string,
  index: number,
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
  selected: boolean = false,
) => (
  <StyledULItem
    $background={selected ? ['grey20', 'mint50'] : ['white']}
    $borderRadius="border-radius-s"
    $font={'heading-light-7'}
    $pa={['', 'all-spacing-2']}
    $ph={['all-spacing-4', '']}
    $pv={['all-spacing-2', '']}
    key={index}
  >
    <StyledOakLink font="heading-6" onClick={onClick} href={`/docs/${slug}`}>
      {title}
    </StyledOakLink>
  </StyledULItem>
);

const DocsNavContainer = styled(OakFlex)`
  @media (min-width: 768px) {
    flex: 0 0 200px;
  }
`;

const VisibleOnFocusOakSecondaryButton = styled(OakSecondaryButton)`
  position: absolute;
  left: -9999px;

  &:has(:focus) {
    position: relative;
    left: auto;
  }
`;

export default function DocsNav({
  items,
  location,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps) {
  const [menuIsOpen, setMenuIsOpen] = useState(false);

  const currentPageTitle = items.reduce(
    (last, curr) => {
      const foundPage = curr.pages.find(
        (page) => location === `/docs/${page.href}`,
      );
      if (foundPage) {
        return foundPage;
      }
      return last;
    },
    { title: '' },
  );

  const IconMod = styled(OakBox)`
    > div {
      width: 100%;
    }
    button:hover {
      text-decoration: none;
    }
    button > div {
      justify-content: space-between;
    }
  `;

  return (
    <DocsNavContainer
      $flexDirection="column"
      $gap={['', 'all-spacing-7']}
      $ml="all-spacing-4"
      $mr={['all-spacing-4', '']}
      $bb={[menuIsOpen ? 'border-solid-s' : '', '']}
      $borderColor={['grey40']}
      aria-label={ariaLabel}
      {...rest}
    >
      <OakBox $display={['none', 'block']}>
        <OakHeading tag="h2" $font="heading-6" $mt="all-spacing-8">
          Documentation
        </OakHeading>
      </OakBox>
      <VisibleOnFocusOakSecondaryButton
        element="a"
        href="#content"
        $display={['none', 'block']}
      >
        Skip to article
      </VisibleOnFocusOakSecondaryButton>
      <OakBox $display={['block', 'none']}>
        {/* mobile nav button */}
        <JauntyAngleLabel
          y="5px"
          $background="lemon"
          as="span"
          $clickThrough={true}
        >
          <strong>Documentation topics</strong>
        </JauntyAngleLabel>
        <IconMod $pt="all-spacing-6" $pb="all-spacing-3">
          <OakSecondaryButton
            onClick={() => setMenuIsOpen(!menuIsOpen)}
            isTrailingIcon={true}
            $font="heading-6"
            iconName={menuIsOpen ? 'chevron-up' : 'chevron-down'}
          >
            {currentPageTitle?.title}
          </OakSecondaryButton>
        </IconMod>
      </OakBox>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <OakFlex
        $display={[menuIsOpen ? 'flex' : 'none', 'flex']}
        id="docs-nav-list"
        $flexDirection="column"
        $gap={['', 'space-between-m2']}
        as="ul"
        role="list"
        $pa={['all-spacing-4', '']}
        style={{
          paddingRight:
            '0' /* there's an injected style deep from oak components adding this - and can't be removed with $pr */,
        }}
      >
        {items.map((item, index) => {
          const { pages } = item;

          // note that I've used an OakBox so I can hide it when narrow
          // although I don't like that there's a nested `div` in the `li`
          return (
            <StyledULItem
              $gap={'space-between-ssx'}
              $font={'heading-7'}
              key={`p-${index}`}
            >
              <OakBox $color="grey60" $display={['none', 'block']}>
                {item.title}
              </OakBox>
              <OakUL role="list">
                {pages.map((page, pageIndex) => {
                  return createNavItem(
                    page.title,
                    page.href,
                    pageIndex,
                    onClick,
                    location === `/docs/${page.href}`,
                  );
                })}
              </OakUL>
            </StyledULItem>
          );
        })}
      </OakFlex>
    </DocsNavContainer>
  );
}
