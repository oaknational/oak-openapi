import {
  OakBox,
  OakIconName,
  OakInlineBanner,
} from '@oaknational/oak-components';

type Notice = {
  text: string;
  icon: string;
  type: string;
};

export const Notice = ({ value }: { value: Notice }) => {
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
