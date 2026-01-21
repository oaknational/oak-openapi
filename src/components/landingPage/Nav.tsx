'use client';

import {
  OakAnchorTarget,
  OakLI,
  OakLink,
  OakUL,
} from '@oaknational/oak-components';
import styled from 'styled-components';

const StyledNav = styled.nav`
  outline: none;
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

export interface NavProps {
  title?: string;
  items: { title: string; href: string }[];
  ariaLabel?: string;
  anchorTarget?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
}

const Nav = ({
  items,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps): React.ReactElement => {
  return (
    <StyledNav aria-label={ariaLabel} {...rest}>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <OakUL role="list">
        {items.map((item, index) => (
          <StyledULItem $font={'heading-6'} key={index}>
            <StyledOakLink
              onClick={onClick}
              href={item.href}
              // $textDecoration="none"
            >
              {item.title}
            </StyledOakLink>
          </StyledULItem>
        ))}
      </OakUL>
    </StyledNav>
  );
};

export default Nav;
