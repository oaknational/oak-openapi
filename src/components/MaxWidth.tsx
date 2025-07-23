import { OakFlex, OakFlexProps } from '@oaknational/oak-components';

const defaultProps: OakFlexProps = {
  $maxWidth: ['100vw', 'all-spacing-24'],
  $ph: ['inner-padding-none', 'inner-padding-s'],
  $flexDirection: 'column',
  $flexGrow: 1,
  $width: '100%',
  $mh: 'auto',
};

export const MaxWidth = (props: OakFlexProps & { as?: string }) => (
  <OakFlex {...{ ...defaultProps, ...props }} />
);
