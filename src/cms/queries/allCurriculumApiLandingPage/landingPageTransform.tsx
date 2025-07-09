import {
  CurriculumApiLandingPage,
  CurriculumApiLandingPageContentBlock,
  CurriculumApiLandingPageHeroBlock,
} from '@/cms/schemaTypes';
import { OakP } from '@oaknational/oak-components';

export type LandingPageContent = {
  title: React.ReactNode;
  description: React.ReactNode | string;
  image: {
    src: string;
    width?: number;
    height?: number;
  };
  link?: {
    text: string;
    href: string;
  };
};

function parseTitle(
  data:
    | CurriculumApiLandingPageHeroBlock
    | CurriculumApiLandingPageContentBlock,
): React.ReactNode | string {
  if ('textAndMedia' in data && data.textAndMedia?.title) {
    return data.textAndMedia.title;
  }
  if (
    'titlePortableTextRaw' in data &&
    data.titlePortableTextRaw &&
    data.titlePortableTextRaw.length > 0
  ) {
    return (
      <>
        {data.titlePortableTextRaw[0].children.map((child) => {
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

function parseDescription(
  data:
    | CurriculumApiLandingPageHeroBlock
    | CurriculumApiLandingPageContentBlock,
): React.ReactNode | string {
  if ('textAndMedia' in data && data.textAndMedia?.bodyRaw) {
    return (
      <>
        {data.textAndMedia.bodyRaw[0].children.map((child) => (
          <OakP key={child._key}>{child.text}</OakP>
        ))}
      </>
    );
  }
  if ('body' in data && data.body) {
    return data.body;
  }
  return '';
}

function parseImage(
  data:
    | CurriculumApiLandingPageHeroBlock
    | CurriculumApiLandingPageContentBlock,
): { src: string; width?: number; height?: number } | null {
  if ('textAndMedia' in data && data.textAndMedia?.image) {
    return {
      src: data.textAndMedia.image.asset.url,
    };
  }
  return null;
}

export function transform(
  root: CurriculumApiLandingPage,
): LandingPageContent[] {
  console.log(root);
  const data = [
    ...root[0].content,
    // root[0].usingTheApiSection,
  ].map((data) => {
    const title = parseTitle(data);
    const description = parseDescription(data);
    const image = parseImage(data);
    // const link = parseLink(data)
    //
    console.log({ image });

    return {
      title,
      description,
      image,
      // link,
    };
  });

  return data as LandingPageContent[];
}
