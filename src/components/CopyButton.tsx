'use client';

import { OakFlex, OakSmallSecondaryButton } from '@oaknational/oak-components';
import { useEffect, useState } from 'react';

/**
 * Copies a value to the clipboard.
 *
 * Not OakCopyLinkButton: that one writes `href || window.location.href` and is
 * labelled "Copy link", so it suits linking to a page, not copying a secret.
 */
export function CopyButton({
  value,
  label = 'Copy',
}: {
  value: string;
  label?: string;
}): React.ReactElement {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) {
      return;
    }
    const timer = setTimeout(() => setCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleClick = async (): Promise<void> => {
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
    } catch {
      // Clipboard access can be denied; leaving the label alone is honest.
      setCopied(false);
    }
  };

  return (
    <OakFlex $alignItems="center" $gap="spacing-8">
      <OakSmallSecondaryButton type="button" onClick={() => void handleClick()}>
        {copied ? 'Copied' : label}
      </OakSmallSecondaryButton>
      <OakFlex role="status" aria-live="polite" $display="none">
        {copied ? `${label} succeeded` : ''}
      </OakFlex>
    </OakFlex>
  );
}
