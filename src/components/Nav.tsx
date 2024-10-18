import { OakAnchorTarget, OakLI } from '@oaknational/oak-components';
import React, { useState } from 'react';
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
  const [currentHref, setCurrentHref] = useState<string | null>(null);

  // Handles the current href - a keyboard user returning to the menu knows the last item they were on
  const handleKeyDown = (event: React.KeyboardEvent<HTMLAnchorElement>) => {
    if (event.key && event.key !== 'Tab') {
      setCurrentHref(event.currentTarget.hash);
    }
  };

  return (
    <StyledNav aria-label={ariaLabel} {...rest}>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <StyledUL role="list">
        {items.map((item, index) => (
          <StyledOLItem $font={'heading-6'} key={index}>
            <StyledOakLink
              onClick={onClick}
              href={item.href}
              aria-current={item.href === currentHref ? 'true' : undefined}
              onKeyDown={handleKeyDown}
            >
              {item.title}
            </StyledOakLink>
          </StyledOLItem>
        ))}
      </StyledUL>
    </StyledNav>
  );
};
