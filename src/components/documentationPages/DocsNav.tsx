'use client';
import {
  OakLI,
  OakUL,
  OakAnchorTarget,
  OakLink,
  OakHeading,
  OakFlex,
} from '@oaknational/oak-components';
import styled from 'styled-components';

import { CurriculumApiDocsNav } from '@/cms/schemaTypes/curriculumApiDocsNav.schema';

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
    $background={selected ? 'mint50' : 'white'}
    $font={'heading-light-7'}
    $pa="all-spacing-2"
    key={index}
  >
    <StyledOakLink font="heading-6" onClick={onClick} href={`/docs/${slug}`}>
      {title}
    </StyledOakLink>
  </StyledULItem>
);

export default function DocsNav({
  items,
  location,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps) {
  return (
    <OakFlex
      $flexDirection="column"
      style={{
        /* because OakFlex doesn't take _all_ flex props */
        flex: '0 0 200px',
      }}
      $gap="all-spacing-7"
      $ml="all-spacing-4"
      aria-label={ariaLabel}
      {...rest}
    >
      <OakHeading tag="h2" $font="heading-6" $mt="all-spacing-8">
        Documentation
      </OakHeading>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <OakFlex
        $flexDirection="column"
        $gap="space-between-m2"
        as="ul"
        role="list"
      >
        {items.map((item, index) => {
          // this is the parent level
          const { pages } = item;
          return (
            <StyledULItem
              $gap="space-between-ssx"
              $font={'heading-7'}
              key={`p-${index}`}
            >
              {item.title}
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
    </OakFlex>
  );
}
