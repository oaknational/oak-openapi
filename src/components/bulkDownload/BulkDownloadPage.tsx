'use client';

import Head from 'next/head';
import { Navigation } from '../Nav';
import { MaxWidth } from '../MaxWidth';
import Footer from '../Footer';
import { useReducer, useEffect, useState } from 'react';
import {
  OakBox,
  OakFieldError,
  OakFlex,
  OakGrid,
  OakHeading,
  OakImage,
  OakLI,
  OakP,
} from '@oaknational/oak-components';
import styled from 'styled-components';
import SelectCard from './SelectCard';
import type { Subjects } from '@/app/(pages)/bulk-download/page';
import CheckBox from '../CheckBox';
import { Authenticate } from './Authenticate';
import { UL } from '../UL';
import { useStableId } from '@/lib/useStableId';

interface BulkDownloadPageProps {
  subjects: Subjects;
}

type SelectionState = Record<string, { primary: boolean; secondary: boolean }>;

type Action =
  | { type: 'TOGGLE_PRIMARY'; payload: string }
  | { type: 'TOGGLE_SECONDARY'; payload: string }
  | { type: 'SET_ALL_PRIMARY'; payload: boolean }
  | { type: 'SET_ALL_SECONDARY'; payload: boolean };

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
    case 'SET_ALL_PRIMARY':
      return Object.keys(state).reduce((acc, slug) => {
        acc[slug] = { ...state[slug], primary: action.payload };
        return acc;
      }, {} as SelectionState);
    case 'SET_ALL_SECONDARY':
      return Object.keys(state).reduce((acc, slug) => {
        acc[slug] = { ...state[slug], secondary: action.payload };
        return acc;
      }, {} as SelectionState);
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

export default function BulkDownloadPage({ subjects }: BulkDownloadPageProps) {
  const [hasError, setHasError] = useState(false);
  const initialSelectionState = subjects.reduce((acc, subject) => {
    acc[subject.slug] = { primary: false, secondary: false };
    return acc;
  }, {} as SelectionState);

  const [selectedSubjects, dispatch] = useReducer(
    selectionReducer,
    initialSelectionState,
  );
  const [allPrimaryChecked, setAllPrimaryChecked] = useState(false);
  const [allSecondaryChecked, setAllSecondaryChecked] = useState(false);

  useEffect(() => {
    const allPrimary = subjects.every(
      (subject) => selectedSubjects[subject.slug]?.primary,
    );
    setAllPrimaryChecked(allPrimary);

    const allSecondary = subjects.every(
      (subject) => selectedSubjects[subject.slug]?.secondary,
    );
    setAllSecondaryChecked(allSecondary);
  }, [selectedSubjects, subjects]);

  const handlePrimaryChange = (subjectSlug: string) => {
    setHasError(false);
    dispatch({ type: 'TOGGLE_PRIMARY', payload: subjectSlug });
  };

  const handleSecondaryChange = (subjectSlug: string) => {
    setHasError(false);
    dispatch({ type: 'TOGGLE_SECONDARY', payload: subjectSlug });
  };

  const handleSelectAllPrimary = (checked: boolean) => {
    setHasError(false);
    dispatch({ type: 'SET_ALL_PRIMARY', payload: checked });
  };

  const handleSelectAllSecondary = (checked: boolean) => {
    setHasError(false);
    dispatch({ type: 'SET_ALL_SECONDARY', payload: checked });
  };

  const hasSelectedSubject = () => {
    for (const subjectSlug in selectedSubjects) {
      if (
        selectedSubjects[subjectSlug].primary ||
        selectedSubjects[subjectSlug].secondary
      ) {
        return true;
      }
    }
    return false;
  };

  const errorId = useStableId('bulk-download-error');

  return (
    <>
      <Head>
        <title>Oak Curriculum API - Oak National Academy</title>
      </Head>
      <Navigation />
      <MaxWidth
        $ph="spacing-16"
        $flexDirection={'column'}
        $pv="spacing-64"
        $gap="spacing-72"
        $color={'black'}
      >
        <OakGrid
          $pv={['spacing-40', 'spacing-48']}
          $ph={['spacing-32', 'spacing-64']}
          $background="bg-decorative1-main"
          $cg="spacing-80"
          $gridTemplateColumns={['1fr', '1fr 1fr']}
          $borderRadius="border-radius-m"
        >
          <OakBox>
            <OakHeading $mv="spacing-24" tag="h1" $font="heading-2">
              Bulk Download
            </OakHeading>
            <OakP $mb="spacing-24">
              Oak's lesson and curriculum text-based data is provided as a
              single JSON for each national curriculum subject and educational
              phase.
            </OakP>
            <WhiteBoxHeading tag="h2" $font="heading-5">
              What's included?
            </WhiteBoxHeading>
            <UL $font="list-item-1">
              <OakLI>Quiz questions and answers </OakLI>
              <OakLI>Teaching transcript</OakLI>
              <OakLI>Misconceptions</OakLI>
              <OakLI>And much more....</OakLI>
            </UL>
          </OakBox>
          <OakBox $display={['none', 'block']}>
            <OakImage
              sizes="width: 2228px, height: 1472px"
              src={{
                src: '/images/bulk-hero.png',
                width: 2228,
                height: 1472,
              }}
              alt=""
              $height="spacing-360"
            />
          </OakBox>
        </OakGrid>

        <OakFlex $gap="spacing-32" $flexDirection="column">
          <OakHeading tag="h2" $font="heading-3">
            Download
          </OakHeading>
          <OakBox>
            <OakFlex $gap="spacing-24" $flexDirection={['column', 'row']}>
              <CheckBox
                label="Select all primary"
                checked={allPrimaryChecked}
                onChange={handleSelectAllPrimary}
              />
              <CheckBox
                label="Select all secondary"
                checked={allSecondaryChecked}
                onChange={handleSelectAllSecondary}
              />
            </OakFlex>
            {hasError && (
              <OakBox id={errorId} $mt="spacing-24">
                <OakFieldError>
                  Select at least one option to download
                </OakFieldError>
              </OakBox>
            )}
          </OakBox>

          <OakGrid
            $rg="spacing-16"
            $cg="spacing-16"
            $gridTemplateColumns="repeat(auto-fill, minmax(300px, 1fr))"
          >
            {subjects.map((subject) => (
              <SelectCard
                key={subject.slug}
                subject={subject.title}
                primaryLessonCount={subject.primary}
                secondaryLessonCount={subject.secondary}
                iconName={`subject-${subject.slug}`}
                $hasError={hasError}
                errorId={hasError ? errorId : undefined}
                primaryChecked={
                  selectedSubjects[subject.slug]?.primary || false
                }
                secondaryChecked={
                  selectedSubjects[subject.slug]?.secondary || false
                }
                onPrimaryChange={() => handlePrimaryChange(subject.slug)}
                onSecondaryChange={() => handleSecondaryChange(subject.slug)}
              />
            ))}
          </OakGrid>
        </OakFlex>
        <Authenticate
          hasSelectedSubject={hasSelectedSubject}
          setHasError={setHasError}
          selectedSubjects={selectedSubjects}
        />
      </MaxWidth>
      <Footer />
    </>
  );
}
