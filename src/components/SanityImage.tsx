import type { CMSImage } from '@/cms/schemaTypes';
import { OakBox } from '@oaknational/oak-components';
import Image from 'next/image';
import React from 'react';

export const SanityImage = (props: { value: CMSImage }): React.ReactElement => {
  const src = props.value.asset.url;
  const altText = props.value.altText || '';
  const { width, height } = props.value.asset.metadata.dimensions;

  return (
    <OakBox $mv="spacing-32">
      <Image
        sizes={`width ${width}px, height: ${height}px`}
        priority={true}
        alt={altText}
        src={src}
        width={width}
        height={height}
        style={{ height: '100%' }}
      />
    </OakBox>
  );
};
