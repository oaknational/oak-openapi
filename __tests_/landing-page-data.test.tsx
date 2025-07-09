import { expect, test } from 'vitest';
import React from 'react';
import { OakP } from '@oaknational/oak-components';
import {
  transformContentBlocks,
  type LandingPageContent,
} from '@/cms/queries/allCurriculumApiLandingPage/landingPageTransform';
import { CurriculumApiLandingPage } from '@/cms/schemaTypes';

const input: CurriculumApiLandingPage = [
  {
    content: [
      {
        titleRaw: [
          {
            markDefs: [],
            children: [
              {
                _type: 'span',
                marks: ['highlight'],
                text: 'Integrate',
                _key: '7cb6449ee332',
              },
              {
                _type: 'span',
                marks: [],
                text: " Oak's high-quality educational content into your service",
                _key: '7b9913ea545f',
              },
            ],
            _type: 'textBlockWithHighlight',
            style: 'normal',
            _key: '2d4136a9ec95',
          },
        ],
        bodyRaw: [
          {
            _type: 'block',
            style: 'normal',
            _key: '9c4158f72973',
            markDefs: [],
            children: [
              {
                marks: [],
                text: 'We’re offering a free API to share our high-quality educational content with the broader education community, all under the Open Government Licence.',
                _key: '8ed7c32f61a9',
                _type: 'span',
              },
            ],
          },
        ],
        image: {
          asset: {
            url: 'https://cdn.sanity.io/images/cuvjke51/feat-table-integration/e677506cf33d4d5713e56e616a695c2b77d9d1fb-560x475.png',
          },
        },
        cta: null,
      },
      {
        titleRaw: [
          {
            _type: 'textBlockWithHighlight',
            style: 'normal',
            _key: 'eae0e786792f',
            markDefs: [],
            children: [
              {
                text: 'Why are we providing an API?',
                _key: '1fd57b483e5e',
                _type: 'span',
                marks: [],
              },
            ],
          },
        ],
        bodyRaw: [
          {
            children: [
              {
                text: 'We’re here to support great teaching. We work to improve pupil outcomes and close the disadvantage gap by supporting teachers to teach, and enabling pupils to access a high-quality curriculum.',
                _key: 'b243f2bb602f',
                _type: 'span',
                marks: [],
              },
            ],
            _type: 'block',
            style: 'normal',
            _key: '5b90f13bcbc0',
            markDefs: [],
          },
          {
            _type: 'block',
            style: 'normal',
            _key: '9d0dce3ff1d2',
            markDefs: [],
            children: [
              {
                _key: '778ca67516c0',
                _type: 'span',
                marks: [],
                text: "As part of this mission, we are providing an API to make our high-quality content available to the wider education market for free on the Open Government Licence. Whether you're an emerging EdTech start-up, an established learning tool, or a quiz-based gaming platform, you can use our content with assurance that it has been created in line with the latest pedagogical research and aligned with our curriculum design principles.",
              },
            ],
          },
        ],
        image: {
          asset: {
            url: 'https://cdn.sanity.io/images/cuvjke51/feat-table-integration/4588ff8aee27a7af5ffb4b81544e00e6f5fd6c79-632x633.png',
          },
        },
        cta: {
          externalLink: '/docs',
          label: 'API overview',
        },
      },
      {
        titleRaw: [
          {
            markDefs: [],
            children: [
              {
                text: 'What you can do with the API?',
                _key: 'c3cdfd3753f1',
                _type: 'span',
                marks: [],
              },
            ],
            _type: 'textBlockWithHighlight',
            style: 'normal',
            _key: '1e1785e79e29',
          },
        ],
        bodyRaw: [
          {
            style: 'normal',
            _key: 'deac6af5cabf',
            markDefs: [],
            children: [
              {
                _key: '790d8cbadb1d',
                _type: 'span',
                marks: [],
                text: 'Through the Oak Curriculum API, you will have access to a wide range of educational content across all subjects for key stages 1-4. Our aim is that the curriculum data and lessons resources in the Oak Curriculum API can be used flexibly within almost any product or service that would benefit teachers and pupils.',
              },
            ],
            _type: 'block',
          },
        ],
        image: {
          asset: {
            url: 'https://cdn.sanity.io/images/cuvjke51/feat-table-integration/698823c6449c9e788c8de3499b155688b0db1034-632x633.png',
          },
        },
        cta: {
          externalLink: '/docs/examples',
          label: 'See examples',
        },
      },
    ],
    usingTheApiSection: {
      mainBlock: {
        titleRaw: [
          {
            style: 'normal',
            _key: '7cd6ef8e03f7',
            markDefs: [],
            children: [
              {
                text: 'Using the API',
                _key: '81e78d344e6b',
                _type: 'span',
                marks: [],
              },
            ],
            _type: 'textBlockWithHighlight',
          },
        ],
        cta: {
          label: 'Request an API key',
          externalLink:
            'https://share.hsforms.com/1gQQFsrHDRf-eZUDajj6NzQbvumd',
        },
        image: {
          isPresentational: true,
          asset: {
            _id: 'image-df07deac8dc51b4e3a8333ed635ba72f0ccd09c3-412x352-png',
            url: 'https://cdn.sanity.io/images/cuvjke51/feat-table-integration/df07deac8dc51b4e3a8333ed635ba72f0ccd09c3-412x352.png',
          },
        },
      },
      siblingBlocks: [
        {
          titleRaw: [
            {
              children: [
                {
                  text: 'API playground',
                  _key: '63cc0e5e3512',
                  _type: 'span',
                  marks: [],
                },
              ],
              _type: 'textBlockWithHighlight',
              style: 'normal',
              _key: '1a6f3c408e39',
              markDefs: [],
            },
          ],
          cta: {
            externalLink: '/playground',
            label: 'Go to the API playground',
          },
          bodyRaw: [
            {
              children: [
                {
                  _key: 'b4ee1a270d65',
                  _type: 'span',
                  marks: [],
                  text: "Integrate Oak content into your product or service. Whether that's streaming Oak lesson videos or slide decks on your platform, pulling Oak questions and answers into your quizzing tool, or something else - you can access our openly-licensed content through the Oak Curriculum API.",
                },
              ],
              _type: 'block',
              style: 'normal',
              _key: '7d7e532408f3',
              markDefs: [],
            },
          ],
        },
      ],
    },
  },
];

const output: LandingPageContent[] = [
  {
    title: (
      <>
        <em key="58f6e0943a8c">Integrate</em> Oak’s high-quality educational
        content into your service
      </>
    ),
    description: (
      <>
        <OakP key="8ed7c32f61a9">
          We’re offering a free API to share our high-quality educational
          content with the broader education community, all under the Open
          Government Licence.
        </OakP>
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

test('landing page data transformation', () => {
  const transformed = transformContentBlocks(input);

  expect(transformed[0].description).toEqual(output[0].description);
  expect(transformed[0].title).toEqual(output[0].title);
  expect(transformed[1].description).toEqual(output[1].description);
  expect(transformed[1].title).toEqual(output[1].title);
});
