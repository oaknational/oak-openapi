import React from 'react';
import CheckBox from '../CheckBox';
import {
  OakFlex,
  OakSpan,
  OakIcon,
  OakIconName,
} from '@oaknational/oak-components';

interface SelectCardProps {
  subject: string;
  primaryLessonCount: number;
  secondaryLessonCount: number;
  primaryChecked?: boolean;
  secondaryChecked?: boolean;
  onPrimaryChange: () => void;
  onSecondaryChange: () => void;
  iconName: string;
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
}) => {
  return (
    <OakFlex
      $display="flex"
      $flexDirection="column"
      $justifyContent="space-between"
      $width="100%"
      $borderRadius="border-radius-m"
      $background="mint50"
      $overflow="hidden"
    >
      <OakFlex
        $flexDirection="column"
        $alignItems="center"
        $width="100%"
        $gap="all-spacing-2"
        $pa="all-spacing-4"
        $pb="all-spacing-5"
        $borderRadius="border-radius-m"
      >
        <OakIcon
          $width="all-spacing-10"
          $height={'all-spacing-10'}
          iconName={iconName as OakIconName}
        />

        <OakSpan $font="heading-6" $textAlign="center" $color="black">
          {subject}
        </OakSpan>
      </OakFlex>
      <OakFlex
        $flexDirection="row"
        $gap="inner-padding-s"
        $pa="all-spacing-4"
        $pt="all-spacing-0"
        $background="mint50"
        $borderRadius="border-radius-m"
      >
        <OakFlex $flexDirection="column" $gap="all-spacing-2" $width="100%">
          {primaryLessonCount > 0 && (
            <DownloadOption
              heading="Primary"
              label={`${primaryLessonCount} lessons`}
              checked={primaryChecked}
              onChange={onPrimaryChange}
            />
          )}
          {secondaryLessonCount > 0 && (
            <DownloadOption
              heading="Secondary"
              label={`${secondaryLessonCount} lessons`}
              checked={secondaryChecked}
              onChange={onSecondaryChange}
            />
          )}
        </OakFlex>
      </OakFlex>
    </OakFlex>
  );
};

interface DownloadOptionProps {
  heading: string;
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}

function DownloadOption({
  heading,
  label,
  checked,
  onChange,
}: DownloadOptionProps) {
  return (
    <label>
      <OakFlex
        $flexDirection="row"
        $alignItems="center"
        $width="100%"
        $gap="all-spacing-4"
        $pa="all-spacing-3"
        $background="white"
        $ba="border-solid-s"
        $borderColor="grey40"
        $borderRadius="border-radius-s"
      >
        <OakFlex
          $flexDirection="column"
          $justifyContent="center"
          $width="100%"
          $gap="all-spacing-1"
        >
          <OakSpan $font="body-2-bold" $color="black">
            {heading}
          </OakSpan>
          <OakSpan $font="body-3" $color="grey60">
            {label}
          </OakSpan>
        </OakFlex>
        <CheckBox checked={checked} onChange={onChange} />
      </OakFlex>
    </label>
  );
}

export default SelectCard;
