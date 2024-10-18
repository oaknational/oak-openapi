import { OakAnchorTarget, OakLI } from '@oaknational/oak-components';
import React from 'react';
import styled from 'styled-components';

const StyledNav = styled.nav`
  outline: none;
`;
const StyledOakLink = styled.a`
  color: #222222;
  display: Flex;
`;

const StyledUL = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  text-decoration: none;
`;

const StyledOLItem = styled(OakLI)`
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

export type NavProps = {
  title?: string;
  items: { title: string; href: string }[];
  ariaLabel?: string;
  anchorTarget?: string;
  onClick?: (event: React.MouseEvent<HTMLAnchorElement, MouseEvent>) => void;
};

export const Nav = ({
  items,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps) => {
  return (
    <StyledNav aria-label={ariaLabel} {...rest}>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <StyledUL role="list">
        {items.map((item, index) => (
          <StyledOLItem $font={'heading-6'} key={index}>
            <StyledOakLink onClick={onClick} href={item.href}>
              {item.title}
            </StyledOakLink>
          </StyledOLItem>
        ))}
      </StyledUL>
    </StyledNav>
  );
};
