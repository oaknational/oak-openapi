'use client';

import {
  OakFieldError,
  OakFlex,
  OakLabel,
  OakModalCenter,
  OakModalCenterBody,
  OakP,
  OakBox,
  OakSecondaryButton,
  OakTextInput,
} from '@oaknational/oak-components';
import { useState } from 'react';
import { ButtonWithSpinner } from '@/components/ButtonWithSpinner';
import { useStableId } from '@/lib/useStableId';

const CONFIRM_TOKEN = 'roll';

export function RollKeyModal({
  isOpen,
  userName,
  onCloseAction,
  onConfirmAction,
}: {
  isOpen: boolean;
  userName: string;
  onCloseAction: () => void;
  onConfirmAction: () => Promise<void>;
}): React.ReactElement {
  const [confirmation, setConfirmation] = useState('');
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState('');
  const confirmId = useStableId('roll-confirm');

  const close = (): void => {
    setConfirmation('');
    setError('');
    onCloseAction();
  };

  const handleConfirm = async (): Promise<void> => {
    setRolling(true);
    setError('');
    try {
      await onConfirmAction();
      setConfirmation('');
    } catch {
      setError('Could not regenerate the key. Please try again.');
    } finally {
      setRolling(false);
    }
  };

  return (
    <OakModalCenter isOpen={isOpen} onClose={close}>
      <OakModalCenterBody iconName="warning" title="Regenerate API key?">
        <OakFlex $flexDirection="column" $gap="spacing-16">
          <OakP>
            This issues a new key for {userName}. Their current key stops
            working immediately, so you must send them the new one. Their
            current hour&apos;s rate limit allowance also resets.
          </OakP>
          <div>
            <OakBox $mb="spacing-8">
              <OakLabel htmlFor={confirmId}>
                Type <strong>{CONFIRM_TOKEN}</strong> to confirm
              </OakLabel>
            </OakBox>
            <OakTextInput
              id={confirmId}
              $pv="spacing-0"
              wrapperWidth="100%"
              $height="spacing-40"
              name="confirm"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
            />
          </div>
          {error && <OakFieldError>{error}</OakFieldError>}
          <OakFlex $gap="spacing-16">
            <ButtonWithSpinner
              type="button"
              isLoading={rolling}
              disabled={confirmation.trim() !== CONFIRM_TOKEN || rolling}
              onClick={handleConfirm}
            >
              {rolling ? 'Regenerating' : 'Regenerate'}
            </ButtonWithSpinner>
            <OakSecondaryButton type="button" onClick={close}>
              Cancel
            </OakSecondaryButton>
          </OakFlex>
        </OakFlex>
      </OakModalCenterBody>
    </OakModalCenter>
  );
}
