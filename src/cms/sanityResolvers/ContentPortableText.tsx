import { PortableTextComponents, PortableText } from '@portabletext/react';
import { FC } from 'react';
import {
  OakHeading,
  OakLI,
  OakLink,
  OakOL,
  OakP,
  OakSecondaryLink,
  OakSpan,
} from '@oaknational/oak-components';
import { PortableTextJSON } from '@/cms/schemaTypes/shared/cms/portableText.schema';
import { Table } from '@/components/Table';
import styled from 'styled-components';
import { Code } from '@/components/Code';
import { Notice } from '@/components/Notice';
import NextImage from 'next/image';
import { SanityImage } from '@/components/SanityImage';
import { SanityCtaLink } from '@/components/SanityCtaLink';
import { UL } from '@/components/UL';

const StrongBox = styled(OakSpan)`
  font-weight: 600;

  a span {
    display: inline-flex;
    flex-direction: row;
  }
`;

const HeadingWithMarginLogic = styled(OakHeading)`
  &:first-child {
    margin-top: 0;
  }
`;

const contentPortableTextComponents: PortableTextComponents = {
  block: {
    normal: (props) => (
      <OakP $font={['body-2', 'body-1']} $mb="all-spacing-4">
        {props.children}
      </OakP>
    ),

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
    h1: (props) => (
      <OakHeading
        tag="h1"
        $mb="space-between-s"
        $font="heading-1"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    h2: (props) => (
      <HeadingWithMarginLogic
        tag="h2"
        id={props.value._key}
        $mb="space-between-s"
        $font="heading-4"
        $mt="all-spacing-12"
      >
        {props.children}
      </HeadingWithMarginLogic>
    ),
    h3: (props) => (
      <HeadingWithMarginLogic
        tag="h3"
        id={props.value._key}
        $mb="space-between-s"
        $font="heading-5"
        $mt="all-spacing-7"
      >
        {props.children}
      </HeadingWithMarginLogic>
    ),
    h4: (props) => (
      <OakHeading
        tag="h4"
        id={props.value._key}
        $mb="space-between-s"
        $font="heading-6"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    h5: (props) => (
      <OakHeading
        tag="h5"
        id={props.value._key}
        $mb="space-between-s"
        $font="heading-7"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
    h6: (props) => (
      <OakHeading
        tag="h6"
        id={props.value._key}
        $mb="space-between-s"
        $font="heading-light-7"
        $mt="space-between-m"
      >
        {props.children}
      </OakHeading>
    ),
  },
  list: {
    bullet: (props) => <UL>{props.children}</UL>,
    number: (props) => (
      <OakOL $ml={['space-between-s', 'space-between-m']} $mb="all-spacing-4">
        {props.children}
      </OakOL>
    ),
  },
  listItem: {
    bullet: (props) => (
      <OakLI $mb="all-spacing-4" $font={['body-2', 'body-1']}>
        {props.children}
      </OakLI>
    ),
    number: (props) => (
      <OakLI $mb="all-spacing-4" $font={['body-2', 'body-1']}>
        {props.children}
      </OakLI>
    ),
  },
  marks: {
    strong: (props) => {
      return <OakSpan as="strong">{props.children}</OakSpan>;
    },
    em: (props) => {
      return <OakSpan as="em">{props.children}</OakSpan>;
    },
    link: (props) => {
      if (props.value.external) {
        return (
          <StrongBox $font="body-2">
            <OakSecondaryLink target="_blank" href={props.value.href}>
              {props.children}
              <NextImage
                src="https://res.cloudinary.com/oak-web-application/image/upload/v1699953892/icons/hlxmejse3mcr4tqo6t8u.svg"
                width="24"
                height="24"
                alt="External link"
              />
            </OakSecondaryLink>
          </StrongBox>
        );
      }
      return <OakLink href={props.value.href}>{props.children}</OakLink>;
    },
  },
  types: {
    table: Table,
    code: Code,
    notice: Notice,
    image: SanityImage,
    ctaLink: SanityCtaLink,
  },
};

export type PortableTextRawProps = {
  portableText: PortableTextJSON;
};

export const ContentPortableText: FC<PortableTextRawProps> = (props) => {
  const { portableText } = props;

  return (
    <PortableText
      components={contentPortableTextComponents}
      value={portableText}
    />
  );
};

export default ContentPortableText;
