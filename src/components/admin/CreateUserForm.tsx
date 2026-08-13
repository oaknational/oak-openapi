'use client';

import {
  OakBox,
  OakFieldError,
  OakFlex,
  OakHeading,
  OakInlineBanner,
  OakLabel,
  OakLI,
  OakP,
  OakSecondaryButton,
  OakSecondaryLink,
  OakTextInput,
  OakUL,
} from '@oaknational/oak-components';
import { useState } from 'react';
import { ButtonWithSpinner } from '@/components/ButtonWithSpinner';
import { CopyButton } from '@/components/CopyButton';
import { useStableId } from '@/lib/useStableId';
import type { AdminUser } from '@/app/api/admin/schemas';
import { AdminApiError, createUser } from './api';
import { KeyValue } from './KeyValue';
import { rateLimitHint, withoutIssue } from './format';

const EMPTY_FORM = { name: '', company: '', email: '', rateLimit: '' };

export function CreateUserForm(): React.ReactElement {
  const [form, setForm] = useState(EMPTY_FORM);
  const [issues, setIssues] = useState<Record<string, string>>({});
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [created, setCreated] = useState<AdminUser | null>(null);

  const nameId = useStableId('name');
  const companyId = useStableId('company');
  const emailId = useStableId('email');
  const rateLimitId = useStableId('rate-limit');
  const rateLimitHintId = useStableId('rate-limit-hint');

  const set = (field: keyof typeof EMPTY_FORM, value: string): void => {
    setForm((current) => ({ ...current, [field]: value }));
    setIssues((current) => withoutIssue(current, field));
  };

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>,
  ): Promise<void> => {
    event.preventDefault();
    setSaving(true);
    setError('');
    setIssues({});

    try {
      const { user } = await createUser({
        name: form.name,
        company: form.company,
        email: form.email,
        // An empty box means "use the default", which the API applies.
        ...(form.rateLimit === '' ? {} : { rateLimit: Number(form.rateLimit) }),
      });
      setCreated(user);
    } catch (caught) {
      if (caught instanceof AdminApiError) {
        setError(caught.message);
        setIssues(
          Object.fromEntries(
            caught.issues.map((issue) => [issue.path, issue.message]),
          ),
        );
      } else {
        setError('Could not reach the server. Please try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  if (created) {
    return (
      <OakFlex $flexDirection="column" $gap="spacing-24">
        <OakInlineBanner
          isOpen
          type="success"
          title="API key created"
          message={`${created.name} can now use the API. This key is not shown again in full anywhere else, so copy it now if you need to send it on.`}
        />
        <OakBox
          $background="bg-neutral"
          $pa="spacing-16"
          $borderRadius="border-radius-m"
        >
          <KeyValue label="API key" value={created.key} monospace>
            <CopyButton value={created.key} label="Copy key" />
          </KeyValue>
        </OakBox>
        <OakFlex $gap="spacing-16" $alignItems="center">
          <OakSecondaryLink href={`/admin/users/${created.id}`}>
            View {created.name}
          </OakSecondaryLink>
          <OakSecondaryButton
            type="button"
            onClick={() => {
              setCreated(null);
              setForm(EMPTY_FORM);
            }}
          >
            Create another
          </OakSecondaryButton>
        </OakFlex>
      </OakFlex>
    );
  }

  return (
    <>
      <OakHeading tag="h2" $font="heading-4" $mb="spacing-24">
        Create an API key
      </OakHeading>

      {error && (
        <OakBox $mb="spacing-24">
          <OakFieldError>
            <OakP>{error}</OakP>
            {Object.keys(issues).length > 0 && (
              <OakUL $mt="spacing-8">
                {Object.entries(issues).map(([path, message]) => (
                  <OakLI key={path}>{message}</OakLI>
                ))}
              </OakUL>
            )}
          </OakFieldError>
        </OakBox>
      )}

      <OakFlex
        as="form"
        noValidate
        $flexDirection="column"
        $gap="spacing-24"
        $maxWidth="spacing-640"
        onSubmit={handleSubmit}
      >
        <div>
          <OakBox $mb="spacing-8">
            <OakLabel htmlFor={nameId}>Individual&apos;s name</OakLabel>
          </OakBox>
          <OakTextInput
            $pv="spacing-0"
            wrapperWidth="100%"
            $height="spacing-40"
            id={nameId}
            name="name"
            value={form.name}
            validity={issues.name ? 'invalid' : undefined}
            aria-invalid={issues.name ? true : undefined}
            onChange={(event) => set('name', event.target.value)}
          />
          {issues.name && <OakFieldError>{issues.name}</OakFieldError>}
        </div>

        <div>
          <OakBox $mb="spacing-8">
            <OakLabel htmlFor={companyId}>Company</OakLabel>
          </OakBox>
          <OakTextInput
            $pv="spacing-0"
            wrapperWidth="100%"
            $height="spacing-40"
            id={companyId}
            name="company"
            value={form.company}
            validity={issues.company ? 'invalid' : undefined}
            aria-invalid={issues.company ? true : undefined}
            onChange={(event) => set('company', event.target.value)}
          />
          {issues.company && <OakFieldError>{issues.company}</OakFieldError>}
        </div>

        <div>
          <OakBox $mb="spacing-8">
            <OakLabel htmlFor={emailId}>Email address</OakLabel>
          </OakBox>
          <OakTextInput
            $pv="spacing-0"
            wrapperWidth="100%"
            $height="spacing-40"
            id={emailId}
            name="email"
            type="email"
            value={form.email}
            validity={issues.email ? 'invalid' : undefined}
            aria-invalid={issues.email ? true : undefined}
            onChange={(event) => set('email', event.target.value)}
          />
          {issues.email && <OakFieldError>{issues.email}</OakFieldError>}
        </div>

        <div>
          <OakBox $mb="spacing-8">
            <OakLabel htmlFor={rateLimitId}>Rate limit (optional)</OakLabel>
            <OakP id={rateLimitHintId} $font="body-3" $color="text-subdued">
              {rateLimitHint}
            </OakP>
          </OakBox>
          <OakTextInput
            $pv="spacing-0"
            wrapperWidth="100%"
            $height="spacing-40"
            id={rateLimitId}
            name="rateLimit"
            type="number"
            min={0}
            value={form.rateLimit}
            aria-describedby={rateLimitHintId}
            validity={issues.rateLimit ? 'invalid' : undefined}
            aria-invalid={issues.rateLimit ? true : undefined}
            onChange={(event) => set('rateLimit', event.target.value)}
          />
          {issues.rateLimit && (
            <OakFieldError>{issues.rateLimit}</OakFieldError>
          )}
        </div>

        <OakFlex $gap="spacing-16">
          <ButtonWithSpinner type="submit" isLoading={saving} disabled={saving}>
            {saving ? 'Generating' : 'Generate API key'}
          </ButtonWithSpinner>
          <OakSecondaryButton
            type="button"
            onClick={() => {
              setForm(EMPTY_FORM);
              setIssues({});
              setError('');
            }}
          >
            Clear
          </OakSecondaryButton>
        </OakFlex>
      </OakFlex>
    </>
  );
}
