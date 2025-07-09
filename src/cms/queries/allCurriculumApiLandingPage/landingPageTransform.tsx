import {
  CMSCta,
  CMSImage,
  CMSRaw,
  CurriculumApiLandingPage,
} from '@/cms/schemaTypes';
import React from 'react'; // required for tests
import { OakP } from '@oaknational/oak-components';

type Link =
  | {
      text: string;
      href: string;
    }
  | undefined;

type Image = {
  src: string;
  width?: number;
  height?: number;
};

type Block = {
  title: React.ReactNode;
  description: React.ReactNode | string;
  link: Link;
};

export type LandingPageContent = {
  title: React.ReactNode;
  description: React.ReactNode | string;
  image: Image;
  link?: Link;
};

export type UsingTheApiSection = {
  title: React.ReactNode;
  image: Image;
  link?: Link;
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
              <OakP key={child._key}>{child.text}</OakP>
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

function parseLink(data: CMSCta): Link | undefined {
  if (!data || !data.externalLink || !data.label) {
    return;
  }
  return {
    text: data.label,
    href: data.externalLink,
  };
}

export function transformContentBlocks(
  root: CurriculumApiLandingPage,
): LandingPageContent[] {
  const data = [...root[0].content].map((data) => {
    const title = parseTitle(data.titleRaw);
    const description = parseDescription(data.bodyRaw);
    const image = parseImage(data.image);
    const link = data.cta ? parseLink(data.cta) : null;

    return {
      title,
      description,
      image,
      link,
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
  const link: Link | undefined = parseLink(input.mainBlock.cta);

  return {
    title,
    image,
    link,
    blocks: input.siblingBlocks.map((block): Block => {
      return {
        title: parseTitle(block.titleRaw),
        description: parseDescription(block.bodyRaw),
        link: parseLink(block.cta),
      };
    }),
  };
}
