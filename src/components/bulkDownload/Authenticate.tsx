'use client';

import { useEffect, useState } from 'react';
import {
  OakBox,
  OakFlex,
  OakPrimaryButton,
  OakTextInput as _OakTextInput,
  OakFieldError,
  OakP,
  OakHeading,
  OakLink,
  OakLI,
  OakLabel,
  OakUL,
} from '@oaknational/oak-components';
import { JauntyAngleLabel } from '../JauntyAngleLabel';
import CheckBox from '../CheckBox';
import styled from 'styled-components';

interface AuthenticateProps {
  hasSelectedSubject: () => boolean;
  setHasError: (hasError: boolean) => void;
}

const ErrorUL = styled(OakUL)`
  list-style-type: disc;
  margin: 0;
  padding-left: 1.5rem;

  li {
    display: list-item;
  }
`;

const OakTextInput = styled(_OakTextInput)`
  padding: 16px 0;
  height: fit-content;
`;

export function Authenticate({
  hasSelectedSubject,
  setHasError,
}: AuthenticateProps) {
  const [apiKey, setApiKey] = useState('');
  const [termsChecked, setTermsChecked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [apiKeyError, setApiKeyError] = useState<boolean | string>(false);
  const [termsError, setTermsError] = useState<boolean | string>(false);
  const [subjectError, setSubjectError] = useState<boolean | string>(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    console.log({ apiKeyError, termsError, subjectError });
    if (!apiKeyError && !termsError && !subjectError) {
      setHasError(false);
      setErrorMessage('');
    }
  }, [apiKeyError, termsError, subjectError, setHasError]);

  const handleDownload = async () => {
    setIsLoading(true);
    let hasError = false;

    if (!termsChecked) {
      setTermsError('Accept terms and conditions to continue');
      hasError = true;
    } else {
      setTermsError(false);
    }

    if (!hasSelectedSubject()) {
      setSubjectError('Select at least one subject to download');
      hasError = true;
      setHasError(true);
    } else {
      setSubjectError(false);
      setHasError(false);
    }

    if (!apiKey) {
      setApiKeyError('Enter a valid API key to continue');
      hasError = true;
    } else {
      if (hasError) {
        setApiKeyError(false);
      } else {
        console.log(`fetch /api/v0/rate-limit with API key: ${apiKey}`);
        // don't bother with API check if we haven't passed the initial checks
        const res = await fetch('/api/v0/rate-limit', {
          headers: {
            'content-type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
          },
        });

        if (!res.ok) {
          setApiKeyError('Enter a valid API key to continue');
          hasError = true;
        } else {
          setApiKeyError(false);
        }
      }
    }

    if (hasError) {
      setErrorMessage('To complete, correct the following:');
      setIsLoading(false);
      return;
    }

    setErrorMessage('');
    console.log('Download button clicked! Mocking API fetch...');

    setIsLoading(false);
    // Mock API fetch here
  };

  return (
    <OakFlex $gap="all-spacing-7" $flexDirection="column" $maxWidth="460px">
      <OakHeading tag="h2" $font="heading-4">
        Authenticate
      </OakHeading>
      <OakBox>
        {apiKeyError && (
          <OakBox $mb="space-between-m">
            <OakFieldError>{apiKeyError}</OakFieldError>
          </OakBox>
        )}
        <JauntyAngleLabel
          error={!!apiKeyError}
          $background="lemon"
          htmlFor="apiKey"
          as="label"
        >
          <strong>API Key</strong>{' '}
          <span style={{ fontWeight: 400 }}>(required)</span>
        </JauntyAngleLabel>
        <OakTextInput
          id="apiKey"
          type="text"
          $pa="inner-padding-m"
          placeholder="Enter your API key"
          value={apiKey}
          onChange={(e) => {
            setApiKeyError(false);
            setApiKey(e.target.value);
          }}
        />
        <OakP $mt="all-spacing-4">
          You will need to authorise yourself with an API key to download
          resources. You can request an API key, or find out more about API
          keys.
        </OakP>
      </OakBox>
      <OakBox>
        {termsError && (
          <OakBox $mb="space-between-m">
            <OakFieldError>{termsError}</OakFieldError>
          </OakBox>
        )}
        <CheckBox
          id="terms"
          checked={termsChecked}
          onChange={setTermsChecked}
          $hasError={!!termsError}
        >
          <OakLabel htmlFor="terms">
            I accept Oak's{' '}
            <OakLink target="_blank" href="/docs/terms">
              terms and conditions
            </OakLink>{' '}
            (required)
          </OakLabel>
        </CheckBox>
      </OakBox>
      {errorMessage && (
        <OakBox $mt="space-between-s">
          <OakFieldError>
            <OakP>{errorMessage}</OakP>
            <ErrorUL $mt="all-spacing-0">
              {subjectError && <OakLI>{subjectError}</OakLI>}
              {apiKeyError && <OakLI>{apiKeyError}</OakLI>}
              {termsError && <OakLI>{termsError}</OakLI>}
            </ErrorUL>
          </OakFieldError>
        </OakBox>
      )}
      <OakPrimaryButton
        disabled={isLoading}
        iconName="download"
        isTrailingIcon={true}
        onClick={handleDownload}
      >
        Download
      </OakPrimaryButton>
    </OakFlex>
  );
}
