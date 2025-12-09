import {
  OakAnchorTarget,
  OakBox,
  OakFlex,
  OakHeading,
  OakLink,
} from '@oaknational/oak-components';

type FeatureProps = {
  title: string;
  children: React.ReactNode;
  cta?: string;
  ctaHref?: string;
  anchorTarget?: string;
  variant?: 'default' | 'mint';
};

export default function Feature({
  title,
  children,
  variant = 'default',
  anchorTarget,
}: FeatureProps) {
  return (
    <OakFlex
      $width="100%"
      $position="relative"
      $flexDirection={'column'}
      $gap="spacing-24"
      $background={variant === "mint" ? "bg-decorative1-subdued" : 'none'}
      $borderRadius={variant === "mint" ? 'border-radius-m' : 'none'}
      $pa={variant === 'mint' ? "spacing-24" : 'none'}
    >
      <OakAnchorTarget id={anchorTarget} />
      <OakHeading $font={'heading-5'} tag="h2">
        {title}
      </OakHeading>
      {children}
      <OakBox $display={['block', 'none', 'none']}>
        <OakLink iconName="arrow-up" href={'#open-api-contents'} isTrailingIcon>
          {'Back to contents'}
        </OakLink>
      </OakBox>
    </OakFlex>
  );
}
