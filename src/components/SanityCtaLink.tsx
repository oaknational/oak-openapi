import type { CMSCta } from '@/cms/schemaTypes';
import {
  OakBox,
  OakFlex,
  type OakIconName,
  OakPrimaryButton,
  OakSecondaryButton,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import React from 'react';

interface SanityCtaLinkProps {
  value: CMSCta;
}

const OakFlexWithImage = styled(OakFlex)<{ background: string }>`
  ${(props) =>
    `background: linear-gradient(rgba(255, 255, 255, 0.5), rgba(255, 255, 255, 0.5)), ${props.background};`}
  background-size: cover;
  width: 100%;
  height: auto;
  aspect-ratio: 1.5;
`;

export const SanityCtaLink = (
  props: SanityCtaLinkProps,
): React.ReactElement => {
  const { externalLink, label, variant, backgroundImageUrl } = props.value;
  const icon = props.value.icon as OakIconName;

  const linkProps = {
    href: externalLink,
    iconName: icon ? icon : undefined,
    isTrailingIcon: true,
    target: icon === 'external' ? '_blank' : undefined,
  };

  const Tag = variant === 'primary' ? OakPrimaryButton : OakSecondaryButton;

  if (backgroundImageUrl) {
    return (
      <OakFlexWithImage
        background={`url(${backgroundImageUrl.asset.url})`}
        $alignItems="center"
        $justifyContent="center"
      >
        <OakBox>
          <Tag element="a" {...linkProps}>
            {label}
          </Tag>
        </OakBox>
      </OakFlexWithImage>
    );
  }

  return (
    <Tag element="a" {...linkProps}>
      {label}
    </Tag>
  );
};
