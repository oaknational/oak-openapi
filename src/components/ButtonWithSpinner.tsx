import { OakPrimaryButton } from '@oaknational/oak-components';
import styled, { css, keyframes } from 'styled-components';

const SpinnerKeyframe = keyframes`
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
`;

// there's a bug in oak-components that prevents the use of the
// OakPrimaryButton.isLoading to be visible.
// The issue is with styled-components@6 - which this project
// _has_ to use because Sanity relies on it.
// But oak-components doesn't work with styled-components@6
// due to a change in the `:after` pseudo-element handling.
// Jamie Blair will have an idea of what this is related to.
export const ButtonWithSpinner = styled(OakPrimaryButton)<{
  $width?: string | string[];
  loaderColor?: string;
}>`
  ${(props) =>
    props.$width
      ? css`
          --width: ${Array.isArray(props.$width)
            ? props.$width[0]
            : props.$width};
          @media (min-width: 768px) {
            --width: ${Array.isArray(props.$width)
              ? props.$width[1] || props.$width[0]
              : props.$width};
          }
          @media (min-width: 1024px) {
            --width: ${Array.isArray(props.$width)
              ? props.$width[2] || props.$width[1] || props.$width[0]
              : props.$width};
          }
        `
      : css`
          --width: 1.25rem;
        `}
  --inner-width: calc(var(--width) / 10 * 8);
  --thickness: calc(var(--width) / 12);

  ${(props) =>
    props.isLoading
      ? css`
          button > div > div > span::after {
            content: ' ';
            display: block;
            width: var(--inner-width);
            height: var(--inner-width);
            margin: var(--thickness);
            border-radius: 50%;
            border: var(--thickness) solid currentcolor;
            border-color: currentcolor currentcolor currentcolor transparent;
            animation: ${SpinnerKeyframe} 1.2s linear infinite;
          }
        `
      : null}
`;
