import { OakLI, OakOL, OakUL } from '@oaknational/oak-components';

import { OakAnchorTarget } from '@oaknational/oak-components';
import React from 'react';
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

export default function DocsNav({
  items,
  ariaLabel,
  anchorTarget,
  onClick,
  ...rest
}: NavProps) {
  return (
    <nav aria-label={ariaLabel} {...rest}>
      {anchorTarget && <OakAnchorTarget id={anchorTarget} />}
      <OakUL role="list">
        {items.map((item, index) => {
          if (isParent(item)) {
            return (
              <OakOL $font={'heading-7'} key={index}>
                <OakLI onClick={onClick} href={items[index + 1].href}>
                  {item.title}
                </OakLI>
              </OakOL>
            );
          }
          return (
            <OakOL $font={'heading-8'} key={index}>
              <OakLI onClick={onClick} href={item.href}>
                {item.title}
              </OakLI>
            </OakOL>
          );
        })}
      </OakUL>
    </nav>
  );
}
