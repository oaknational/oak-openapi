import { OakBox, OakFlex } from '@oaknational/oak-components';
import styled, { css } from 'styled-components';

const Value = styled(OakBox)<{ $monospace?: boolean }>`
  ${({ $monospace }: { $monospace?: boolean }) =>
    $monospace
      ? css`
          font-family: monospace;
          word-break: break-all;
        `
      : null}
`;

/** One labelled fact. Used inside the <dl> on the user detail page. */
export function KeyValue({
  label,
  value,
  monospace,
  children,
}: {
  label: string;
  value: React.ReactNode;
  monospace?: boolean;
  children?: React.ReactNode;
}): React.ReactElement {
  return (
    <OakFlex $flexDirection="column" $gap="spacing-4">
      <OakBox as="dt" $font="body-3-bold" $color="text-subdued">
        {label}
      </OakBox>
      <OakBox as="dd" $ma="spacing-0">
        <OakFlex $alignItems="center" $gap="spacing-12" $flexWrap="wrap">
          <Value $font="body-2" $monospace={monospace}>
            {value}
          </Value>
          {children}
        </OakFlex>
      </OakBox>
    </OakFlex>
  );
}
