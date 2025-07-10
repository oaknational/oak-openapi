import { PortableTextComponents, PortableText } from '@portabletext/react';
import { FC } from 'react';
import {
  OakHeading,
  OakLI,
  OakOL,
  OakP,
  OakSpan,
} from '@oaknational/oak-components';

import { PortableTextJSON } from '@/cms/schemaTypes/shared/cms/portableText.schema';
import { Table } from '@/components/Table';
const contentPortableTextComponents: PortableTextComponents = {
  block: {
    normal: (props) => <OakP>{props.children}</OakP>,
    sectionHeading: (props) => (
      <OakHeading
        $font={['heading-6', 'heading-4']}
        tag="h2"
        $mt={['space-between-l', 'space-between-xl']}
        $mb={['space-between-m', 'space-between-m2']}
      >
        {props.children}
      </OakHeading>
    ),
    heading1: (props) => (
      <OakHeading
        tag="h2"
        $mb="space-between-s"
        $font="heading-5"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    heading2: (props) => (
      <OakHeading
        tag="h3"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    heading3: (props) => (
      <OakHeading
        tag="h4"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    heading4: (props) => (
      <OakHeading
        tag="h5"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    heading5: (props) => (
      <OakHeading
        tag="h6"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    heading6: (props) => (
      <OakHeading
        tag="h6"
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
  },
  list: {
    bullet: (props) => <ul>{props.children}</ul>,
    number: (props) => (
      <OakOL $ml={['space-between-s', 'space-between-m']}>
        {props.children}
      </OakOL>
    ),
  },
  listItem: {
    bullet: (props) => (
      <OakLI $font={['list-item-2', 'list-item-1']}>{props.children}</OakLI>
    ),
    number: (props) => (
      <OakLI $font={['list-item-2', 'list-item-1']}>{props.children}</OakLI>
    ),
  },
  marks: {
    strong: (props) => {
      return <OakSpan as="strong">{props.children}</OakSpan>;
    },
    em: (props) => {
      return <OakSpan as="em">{props.children}</OakSpan>;
    },
  },
  types: {
    table: Table,
  },
};

export type PortableTextRawProps = {
  portableText: PortableTextJSON;
};

export const ContentPortableText: FC<PortableTextRawProps> = (props) => {
  const { portableText } = props;

  return (
    <>
      <PortableText
        components={contentPortableTextComponents}
        value={portableText}
      />
    </>
  );
};

export default ContentPortableText;
