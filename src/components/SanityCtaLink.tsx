import { CMSCta } from '@/cms/schemaTypes';
import {
  OakIconName,
  OakPrimaryButton,
  OakSecondaryButton,
} from '@oaknational/oak-components';

type SanityCtaLinkProps = {
  value: CMSCta;
};

export const SanityCtaLink = (props: SanityCtaLinkProps) => {
  const { externalLink, label, variant } = props.value;
  const icon = props.value.icon as OakIconName;

  const linkProps = {
    href: externalLink,
    iconName: icon ? icon : undefined,
    isTrailingIcon: true,
    target: icon === 'external' ? '_blank' : undefined,
  };

  if (variant === 'primary') {
    return (
      <OakPrimaryButton element="a" {...linkProps}>
        {label}
      </OakPrimaryButton>
    );
  }

  return (
    <OakSecondaryButton element="a" {...linkProps}>
      {label}
    </OakSecondaryButton>
  );
};
