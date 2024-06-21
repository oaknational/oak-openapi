import { OakSpan } from '@oaknational/oak-components';

export default function Pill({ children }) {
  return (
    <OakSpan
      $background="mint"
      $borderRadius="border-radius-circle"
      $pa="inner-padding-l">
      {children}
    </OakSpan>
  );
}
