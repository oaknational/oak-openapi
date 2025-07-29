import { Asset } from '@/cms/schemaTypes';
import { OakBox } from '@oaknational/oak-components';
import Image from 'next/image';

export const SanityImage = (props: { value: { asset: Asset } }) => {
  const src = props.value.asset.url;
  const altText = props.value.asset?.altText || '';
  const { width, height } = props.value.asset.metadata.dimensions;

  return (
    <OakBox $mv="all-spacing-7">
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
