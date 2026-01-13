import React from 'react';
import CheckBox from '../CheckBox';
import {
  OakFlex,
  OakSpan,
  OakIcon,
  OakIconName,
} from '@oaknational/oak-components';
import { useStableId } from '@/lib/useStableId';

interface SelectCardProps {
  subject: string;
  primaryLessonCount: number;
  secondaryLessonCount: number;
  primaryChecked?: boolean;
  secondaryChecked?: boolean;
  onPrimaryChange: () => void;
  onSecondaryChange: () => void;
  iconName: string;
  $hasError?: boolean;
  errorId?: string;
}

const SelectCard: React.FC<SelectCardProps> = ({
  subject,
  primaryLessonCount,
  secondaryLessonCount,
  primaryChecked = false,
  secondaryChecked = false,
  onPrimaryChange,
  onSecondaryChange,
  iconName,
  $hasError = false,
  errorId,
}) => {
  const id = useStableId('select-card');
  return (
    <OakFlex
      $display="flex"
      $flexDirection="column"
      $justifyContent="space-between"
      $width="100%"
      $borderRadius="border-radius-m"
      $background="bg-decorative1-subdued"
      $overflow="hidden"
      role="group"
      aria-labelledby={id}
    >
      <OakFlex
        $flexDirection="column"
        $alignItems="center"
        $width="100%"
        $gap="spacing-8"
        $pa="spacing-16"
        $pb="spacing-20"
        $borderRadius="border-radius-m"
      >
        <OakIcon
          $width="spacing-56"
          $height={'spacing-56'}
          iconName={iconName as OakIconName}
        />

        <OakSpan
          $font="heading-6"
          $textAlign="center"
          $color="text-primary"
          id={id}
        >
          {subject}
        </OakSpan>
      </OakFlex>
      <OakFlex
        $flexDirection="row"
        $gap="spacing-12"
        $pa="spacing-16"
        $pt="spacing-0"
        $background="bg-decorative1-subdued"
        $borderRadius="border-radius-m"
      >
        <OakFlex $flexDirection="column" $gap="spacing-8" $width="100%">
          {primaryLessonCount > 0 && (
            <DownloadOption
              heading="Primary"
              checked={primaryChecked}
              onChange={onPrimaryChange}
              $hasError={$hasError}
              errorId={errorId}
            />
          )}
          {secondaryLessonCount > 0 && (
            <DownloadOption
              heading="Secondary"
              checked={secondaryChecked}
              onChange={onSecondaryChange}
              $hasError={$hasError}
              errorId={errorId}
            />
          )}
        </OakFlex>
      </OakFlex>
    </OakFlex>
  );
};

interface DownloadOptionProps {
  heading: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  $hasError?: boolean;
  errorId?: string;
}

function DownloadOption({
  heading,
  checked,
  onChange,
  $hasError = false,
  errorId,
}: DownloadOptionProps) {
  const id = useStableId('chk');
  return (
    <OakFlex
      $flexDirection="row"
      $alignItems="center"
      $width="100%"
      $gap="spacing-16"
      $pa="spacing-12"
      $background="bg-primary"
      $ba="border-solid-s"
      $borderColor="border-neutral-lighter"
      $borderRadius="border-radius-s"
    >
      <OakFlex
        $flexDirection="column"
        $justifyContent="center"
        $width="100%"
        $gap="spacing-4"
      >
        <OakSpan $font="body-2-bold" $color="text-primary">
          <label suppressHydrationWarning htmlFor={id}>
            {heading}
          </label>
        </OakSpan>
      </OakFlex>
      <CheckBox
        aria-describedby={errorId}
        id={id}
        $hasError={$hasError}
        checked={checked}
        onChange={onChange}
      />
    </OakFlex>
  );
}

export default SelectCard;
