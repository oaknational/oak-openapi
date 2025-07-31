import {
  CMSCta,
  CMSImage,
  CMSRaw,
  CurriculumApiLandingPage,
} from '@/cms/schemaTypes';
import React from 'react'; // required for tests
import { OakP } from '@oaknational/oak-components';

type Image = {
  src: string;
  width?: number;
  height?: number;
};

type Block = {
  title: React.ReactNode;
  description: React.ReactNode | string;
  link: CMSCta;
};

export type LandingPageContent = {
  title: React.ReactNode;
  description: React.ReactNode | string;
  image: Image;
  link?: CMSCta;
};

export type UsingTheApiSection = {
  title: React.ReactNode;
  image: Image;
  link?: CMSCta;
  blocks: Block[];
};

function parseTitle(data: CMSRaw): React.ReactNode | string {
  if (data.length > 0) {
    return (
      <>
        {data[0].children.map((child) => {
          if (child.marks.includes('highlight')) {
            return <em key={child._key}>{child.text}</em>;
          }
          return child.text;
        })}
      </>
    );
  }
  return '';
}

function parseDescription(data: CMSRaw): React.ReactNode | string {
  if (data) {
    return (
      <>
        {data
          .map((_) =>
            _.children.map((child) => (
              <OakP
                $font={['body-2', 'body-1']}
                $color="black"
                key={child._key}
              >
                {child.text}
              </OakP>
            )),
          )
          .flat()}
      </>
    );
  }
  return '';
}

function parseImage(data: CMSImage): {
  src: string;
  width?: number; // these are never on there… not yet at least
  height?: number;
} {
  return {
    src: data.asset.url,
  };
}

export function transformContentBlocks(
  root: CurriculumApiLandingPage,
): LandingPageContent[] {
  const data = [...root[0].content].map((data) => {
    const title = parseTitle(data.titleRaw);
    const description = parseDescription(data.bodyRaw);
    const image = parseImage(data.image);

    return {
      title,
      description,
      image,
      link: data.cta,
    };
  });

  return data as LandingPageContent[];
}

export function transformUsingTheAPI(
  root: CurriculumApiLandingPage,
): UsingTheApiSection {
  const input = root[0].usingTheApiSection;
  const title = parseTitle(input.mainBlock.titleRaw);
  const image = parseImage(input.mainBlock.image);
  const link = input.mainBlock.cta;

  return {
    title,
    image,
    link,
    blocks: input.siblingBlocks.map((block): Block => {
      return {
        title: parseTitle(block.titleRaw),
        description: parseDescription(block.bodyRaw),
        link: block.cta,
      };
    }),
  };
}
