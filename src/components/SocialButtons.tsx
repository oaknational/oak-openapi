import {
  OakFlex,
  OakFlexProps,
  OakIconName,
  OakLink,
} from '@oaknational/oak-components';
import { FC, useId } from 'react';
import styled from 'styled-components';

const OakSocialLink = styled(OakLink)`
  color: inherit;
  &:hover {
    color: inherit;
  }
}`;

export const OAK_SOCIALS: Record<SocialNetwork, string> = {
  instagram: 'oaknational',
  facebook: 'oaknationalacademy',
  x: 'oaknational',
  linkedIn: 'https://www.linkedin.com/company/oak-national-academy',
};

const getSocialUrl = (network: SocialNetwork, usernameOrUrl: string) => {
  switch (network) {
    case 'instagram':
      return `https://instagram.com/${usernameOrUrl}`;
    case 'facebook':
      return `https://facebook.com/${usernameOrUrl}`;
    case 'x':
      return `https://x.com/${usernameOrUrl}`;
    case 'linkedIn':
      return usernameOrUrl;
  }
};

const SOCIAL_NETWORKS = ['instagram', 'facebook', 'x', 'linkedIn'] as const;
type SocialNetwork = (typeof SOCIAL_NETWORKS)[number];
type SocialButtonConfig = {
  label: string;
  icon: OakIconName;
};
const SOCIAL_BUTTON_CONFIGS: Record<SocialNetwork, SocialButtonConfig> = {
  instagram: {
    label: 'instagram',
    icon: 'instagram',
  },
  facebook: {
    label: 'facebook',
    icon: 'facebook',
  },
  x: {
    label: 'x',
    icon: 'x',
  },
  linkedIn: {
    label: 'linkedIn',
    icon: 'linkedin',
  },
} as const;

type SocialUrls = Partial<Record<SocialNetwork, string | null | undefined>>;
type ResponsiveValues<Value> = (Value | null) | (Value | null)[];
type SocialButtonsProps = OakFlexProps &
  SocialUrls & {
    /**
     * for: who's social media accounts are being linekd
     * @example Oak National Academy
     * @example Joan Baez
     */
    for: string;
    size?: 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge' | 'xxxlarge';
    spaceBetween?: ResponsiveValues<number>;
  };
const SocialButtons: FC<SocialButtonsProps> = (props) => {
  const { for: accountHolder, ...flexProps } = props;
  const id = useId();
  const socialsToShow = SOCIAL_NETWORKS.filter((network) => props[network]);

  if (socialsToShow.length === 0) {
    return null;
  }

  return (
    <OakFlex $gap={'all-spacing-4'} {...flexProps}>
      {socialsToShow.map((network) => {
        const { label, icon } = SOCIAL_BUTTON_CONFIGS[network];
        const profile = props[network];
        if (!profile) {
          return null;
        }
        const href = getSocialUrl(network, profile);
        if (!href) {
          return null;
        }
        return (
          <OakSocialLink
            key={`SocialButtons-${id}-${network}`}
            aria-label={`${label} for ${accountHolder}`}
            iconName={icon}
            href={href}
            color="black"
            hoverColor="black"
            target="_blank"
          />
        );
      })}
    </OakFlex>
  );
};

export default SocialButtons;
