'use client';
import {
  OakLI,
  OakUL,
  OakAnchorTarget,
  OakLink,
} from '@oaknational/oak-components';
import styled from 'styled-components';

import {
  NavItem,
  NavItems,
} from '@/cms/schemaTypes/shared/components/NavItems.schema';

export type NavProps = {
  title?: string;
  items: NavItems;
  ariaLabel?: string;
  anchorTarget?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

const isParent = (item: NavItem) => {
  const splitHref = item.href.split('/').slice(1);
  return splitHref.length < 2;
};

const StyledNav = styled.nav`
  outline: none;
  min-width: 20%;
`;

const StyledOakLink = styled(OakLink)`
  color: #222222;
  display: Flex;
  text-decoration: none;

  &:visited,
  &:hover,
  &:visited:hover {
    color: #222222;
  }
`;

const StyledULItem = styled(OakLI)`
  position: relative;
  counter-increment: list-counter;
  display: flex;
  align-items: center;
  color: #222222;
  margin-bottom: 20px;

  min-height: 40px;
  &:last-child {
    margin-bottom: 0;
  }

  &:hover {
    text-decoration: underline;
    color: #575757;
  }
`;

const createNavItem = (
  title: string,
  index: number,
  slug: string,
  isParent: boolean,
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void,
) => (
  <StyledULItem $font={isParent ? 'heading-7' : 'heading-8'} key={index}>
    <StyledOakLink onClick={onClick} href={`/docs/${slug}`}>
      {title}
    </StyledOakLink>
  </StyledULItem>
);

export default function DocsNav({
  items,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps) {
  return (
    <StyledNav aria-label={ariaLabel} {...rest}>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <OakUL role="list">
        {items.map((item, index) => {
          const parent: boolean = isParent(item);
          // Get the next slug if a parent
          // Remove this if group headings aren't clickable
          const href = parent ? items[index + 1].href : item.href;
          return createNavItem(item.title, index, href, parent, onClick);
        })}
      </OakUL>
    </StyledNav>
  );
}
