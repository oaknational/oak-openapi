import { OakFlex, type OakFlexProps } from '@oaknational/oak-components';
import React from 'react';

const defaultProps: OakFlexProps = {
  $maxWidth: ['100vw', 'spacing-1280'],
  $ph: ['spacing-0', 'spacing-12'],
  $flexDirection: 'column',
  $flexGrow: 1,
  $width: '100%',
  $mh: 'auto',
};

export const MaxWidth = (
  props: OakFlexProps & { as?: string },
): React.ReactElement => <OakFlex {...{ ...defaultProps, ...props }} />;
