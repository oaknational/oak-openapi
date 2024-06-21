import { OakFlex, OakLink, OakSpan } from '@oaknational/oak-components';

type FeatureProps = {
  title: string;
  children: React.ReactNode;
  cta?: string;
  ctaHref?: string;
};

export default function Feature({
  title,
  children,
  cta,
  ctaHref,
}: FeatureProps) {
  return (
    <OakFlex $flexDirection={'column'} $gap="all-spacing-6">
      <h3>{title}</h3>
      <p>{children}</p>
      {cta ? (
        <OakLink href={ctaHref}>
          <OakSpan $font={'body-2-bold'}>{cta}</OakSpan>
        </OakLink>
      ) : null}
    </OakFlex>
  );
}
