import {
  OakBox,
  type OakIconName,
  OakInlineBanner,
} from '@oaknational/oak-components';
import React from 'react';

interface Notice {
  text: string;
  icon: string;
  type: string;
}

export const Notice = ({ value }: { value: Notice }): React.ReactElement => {
  return (
    <OakBox $mb="spacing-24">
      <OakInlineBanner
        isOpen
        message={value.text}
        icon={(value.icon || '') as OakIconName}
        type={
          (value.type || 'info') as
            | 'info'
            | 'neutral'
            | 'success'
            | 'alert'
            | 'warning'
            | 'error'
        }
        variant="regular"
      />
    </OakBox>
  );
};
