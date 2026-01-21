'use client';
import { useState } from 'react';
import {
  OakBox,
  OakFlex,
  OakIcon,
  OakP,
  OakTextInput as _OakTextInput,
  OakPrimaryButton,
  OakFieldError,
} from '@oaknational/oak-components';
import { JauntyAngleLabel } from '../JauntyAngleLabel';
import styled from 'styled-components';

export interface HubspotPayload {
  fields: {
    name: string;
    value: string | undefined;
  }[];
  context: {
    pageUri: string;
    pageName: string;
    hutk?: string | undefined;
  };
}

const FlexedBox = styled(OakBox)`
  flex: 1;
`;

export function GetUpdates(): React.ReactElement {
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [success, setSuccess] = useState(false);

  const formId = 'ecd7b5fb-fceb-4342-8d60-a1938e3b5894';
  const portalId = '19961797';
  const hubspotUrl =
    'https://hubspot-forms.thenational.academy/submissions/v3/integration/submit';

  const handleSubmit = async (
    e: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    // Prevent default form submission
    e.preventDefault();

    // Check if the form is valid
    const form = e.currentTarget;
    if (!form.checkValidity()) {
      setMessage('Enter a valid email to continue');
      // form.reportValidity();
      return;
    }

    // Handle successful submission logic here
    const url = `${hubspotUrl}/${portalId}/${formId}`;

    let res: Response;

    try {
      const body: HubspotPayload = {
        fields: [
          {
            name: 'email',
            value: email,
          },
        ],
        context: {
          pageUri: window.location.href,
          pageName: document.title,
        },
      };

      res = await fetch(url, {
        method: 'POST',
        mode: 'cors',
        cache: 'no-cache',
        credentials: 'same-origin',

        headers: {
          'content-type': 'application/json',
        },
        body: JSON.stringify(body),
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      return;
    }

    const { inlineMessage } = (await res.json()) as {
      inlineMessage?: string;
    };
    if (inlineMessage) {
      // If the submission was successful, show a success message
      setMessage(inlineMessage);
      setEmail(''); // Clear the email input
      return;
    }

    setMessage('');
    setSuccess(true);
  };

  return (
    <FlexedBox
      as="form"
      $action="/"
      $color="black"
      noValidate
      onSubmit={handleSubmit}
    >
      <OakBox $ma="0" $pa="0" as="fieldset" $ba="border-solid-none">
        <OakFlex as="h2" $font="heading-5" $gap="spacing-8">
          <OakIcon iconName="bell" />
          Receive updates
        </OakFlex>
        <OakP $mt="spacing-8" $mb="spacing-32">
          Sign up to our mailing list to receive important updates about the
          API.
        </OakP>
        <OakBox $mt="spacing-24">
          {success && (
            <OakFlex $flexDirection="row" $gap="spacing-12">
              <OakIcon iconName="success" />{' '}
              <strong>Thank you, your request has been received.</strong>
            </OakFlex>
          )}
          {message && (
            <OakBox $mb="spacing-24">
              <OakFieldError>{message}</OakFieldError>
            </OakBox>
          )}
          {!success && (
            <>
              <JauntyAngleLabel $background="lemon" htmlFor="email" as="label">
                <strong>Email address</strong>{' '}
                <span style={{ fontWeight: 400 }}>(required)</span>
              </JauntyAngleLabel>
              <OakTextInput
                autoComplete="email"
                id="email"
                type="email"
                $pa="spacing-16"
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </>
          )}
        </OakBox>
        {!success && (
          <OakBox $mt="spacing-24">
            <OakPrimaryButton>Sign up for updates</OakPrimaryButton>
          </OakBox>
        )}
      </OakBox>
    </FlexedBox>
  );
}

const OakTextInput = styled(_OakTextInput)`
  padding: 16px 0;
  height: fit-content;
`;
