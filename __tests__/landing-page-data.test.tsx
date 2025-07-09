import { expect, test } from 'vitest';
import React from 'react';
import { OakP } from '@oaknational/oak-components';
import {
  transformContentBlocks,
  type LandingPageContent,
} from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import documentationQuery from '@/cms/queries/allCurriculumApiLandingPage/landingPage.query';

const output: LandingPageContent[] = [
  {
    title: (
      <>
        <em key="7cb6449ee332">Integrate</em> Oak's high-quality educational
        content into your service
      </>
    ),
    description: (
      <>
        {[
          <OakP key="8ed7c32f61a9">
            We’re offering a free API to share our high-quality educational
            content with the broader education community, all under the Open
            Government Licence.
          </OakP>,
        ]}
      </>
    ),
    image: {
      src: '/images/api_1.png',
      width: 2228,
      height: 1472,
    },
  },
  {
    title: 'Why are we providing an API?',
    description: (
      <>
        <OakP key="97eb46f1095a">
          We’re here to support great teaching. We work to improve pupil
          outcomes and close the disadvantage gap by supporting teachers to
          teach, and enabling pupils to access a high-quality curriculum.
        </OakP>
        <OakP key="97eb46f1095b">
          As part of this mission, we are providing an API to make our
          high-quality content available to the wider education market for free
          on the Open Government Licence. Whether you’re an emerging EdTech
          start-up, an established learning tool, or a quiz-based gaming
          platform, you can use our content with assurance that it has been
          created in line with the latest pedagogical research and aligned with
          our curriculum design principles.
        </OakP>
      </>
    ),
    image: {
      src: '/images/api_2.png',
      width: 2228,
      height: 1472,
    },
    link: {
      text: 'API Overview',
      href: '/#api-overview',
    },
  },
  {
    title: 'What you can do with the API?',
    description:
      'Through the Oak Curriculum API, you will have access to a wide range of educational content across all subjects for key stages 1-4. Our aim is that the curriculum data and lessons resources in the Oak Curriculum API can be used flexibly within almost any product or service that would benefit teachers and pupils.',
    image: {
      src: '/images/api_3.png',
      width: 2228,
      height: 1472,
    },
    link: {
      text: 'See Examples',
      href: '/#examples',
    },
  },
];

test('landing page data transformation', async () => {
  const input = await documentationQuery();
  const transformed = transformContentBlocks(input);

  expect(transformed[0].description).toEqual(output[0].description);
  expect(transformed[0].title).toEqual(output[0].title);
  expect(transformed[1].description).toEqual(output[1].description);
  expect(transformed[1].title).toEqual(output[1].title);
});
