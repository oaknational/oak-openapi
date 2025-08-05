'use client';

import Head from 'next/head';
import { Navigation } from '../Nav';
import { MaxWidth } from '../MaxWidth';
import Footer from '../Footer';
import { useReducer, useEffect } from 'react';
import {
  OakBox,
  OakGrid,
  OakHeading,
  OakImage,
  OakLI,
  OakP,
  OakUL,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import SelectCard from './SelectCard';
import type { Subjects } from '@/app/(pages)/bulk-download/page';

interface BulkDownloadPageProps {
  subjects: Subjects;
}

type SelectionState = Record<string, { primary: boolean; secondary: boolean }>;

type Action =
  | { type: 'TOGGLE_PRIMARY'; payload: string }
  | { type: 'TOGGLE_SECONDARY'; payload: string };

const selectionReducer = (state: SelectionState, action: Action) => {
  switch (action.type) {
    case 'TOGGLE_PRIMARY':
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          primary: !state[action.payload]?.primary,
        },
      };
    case 'TOGGLE_SECONDARY':
      return {
        ...state,
        [action.payload]: {
          ...state[action.payload],
          secondary: !state[action.payload]?.secondary,
        },
      };
    default:
      return state;
  }
};

const WhiteBoxHeading = styled(OakHeading)`
  display: inline-block;
  background: white;
  padding: 6px 4px;
  margin-left: -4px;
  margin-top: -6px;
`;

const ProperUL = styled(OakUL)`
  list-style-type: disc;
  margin: 1em 0;
  padding-left: 1.5rem;

  li {
    display: list-item;
  }
`;

export default function BulkDownloadPage({ subjects }: BulkDownloadPageProps) {
  const [selectedSubjects, dispatch] = useReducer(selectionReducer, {});

  useEffect(() => {
    console.log('Selected Subjects:', selectedSubjects);
  }, [selectedSubjects]);

  const handlePrimaryChange = (subjectSlug: string) => {
    dispatch({ type: 'TOGGLE_PRIMARY', payload: subjectSlug });
  };

  const handleSecondaryChange = (subjectSlug: string) => {
    dispatch({ type: 'TOGGLE_SECONDARY', payload: subjectSlug });
  };

  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Navigation />
      <MaxWidth
        $ph="inner-padding-m"
        $flexDirection={'column'}
        $pv="inner-padding-xl6"
        $gap="all-spacing-12"
        $color={'black'}
      >
        <OakGrid
          $pv="inner-padding-xl4"
          $ph="inner-padding-xl6"
          $background="mint"
          $cg="space-between-xxxl"
          $gridTemplateColumns="1fr 1fr"
        >
          <OakBox>
            <OakHeading $mv="space-between-m" tag="h1" $font="heading-2">
              Bulk Download
            </OakHeading>
            <OakP $mb="space-between-m">
              Oak's lesson and curriculum text-based data is provided as a
              single JSON for each national curriculum subject and educational
              phase.
            </OakP>
            <WhiteBoxHeading tag="h2" $font="heading-5">
              What's included?
            </WhiteBoxHeading>
            <ProperUL $font="list-item-1">
              <OakLI>Quiz questions and answers </OakLI>
              <OakLI>Teaching transcript</OakLI>
              <OakLI>Misconceptions</OakLI>
              <OakLI>And much more....</OakLI>
            </ProperUL>
          </OakBox>
          <OakBox>
            <OakImage
              sizes="width: 2228px, height: 1472px"
              src={{
                src: '/images/bulk-hero.png',
                width: 2228,
                height: 1472,
              }}
              alt=""
              $height="all-spacing-20"
            />
          </OakBox>
        </OakGrid>

        <OakHeading tag="h2" $font="heading-3">
          Download
        </OakHeading>
        <OakGrid
          $rg="space-between-s"
          $cg="space-between-s"
          $gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
        >
          {subjects.map((subject) => (
            <SelectCard
              key={subject.slug}
              subject={subject.title}
              primaryFileSize="100 MB"
              secondaryFileSize="50 MB"
              iconName={`subject-${subject.slug}`}
              primaryChecked={selectedSubjects[subject.slug]?.primary || false}
              secondaryChecked={
                selectedSubjects[subject.slug]?.secondary || false
              }
              onPrimaryChange={() => handlePrimaryChange(subject.slug)}
              onSecondaryChange={() => handleSecondaryChange(subject.slug)}
            />
          ))}
        </OakGrid>
      </MaxWidth>
      <Footer />
    </>
  );
}
