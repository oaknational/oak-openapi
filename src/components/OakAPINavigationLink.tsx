import { OakSecondaryLink as _OakSecondaryLink } from '@oaknational/oak-components';
import styled from 'styled-components';

export const OakAPINavigationLink = styled(_OakSecondaryLink)`
  text-decoration: none;

  & > span + div {
    margin-left: 0.25rem;
  }
  & > div + span {
    margin-right: 0.25rem;
  }

  &:hover {
    text-decoration: underline;
  }

  &:focus-visible {
    text-decoration: none;

    border-radius: 0;
    box-shadow:
      0 0 0 0.125rem rgba(255, 229, 85, 1),
      0 0 0 0.3rem rgba(87, 87, 87, 1);
  }

  &:active {
    text-decoration: none;

    border-radius: 0;
    box-shadow:
      2px 2px 0 0px rgba(255, 229, 85, 1),
      5px 5px 0 0px rgba(87, 87, 87, 1);
  }

  &.selected {
    position: relative;

    &:hover {
      text-decoration: none;
    }

    &::after {
      position: absolute;
      content: '';
      display: block;
      width: calc(100% - 8px);
      height: 4px; /* match the viewBox height */
      background: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' fill='none' preserveAspectRatio='none' viewBox='0 0 147 9'><path fill='currentColor' d='M.944 7.137c2.052.993 4.243 1.172 6.529 1.155 15.127-.11 30.222-.151 45.334-.344 15.733-.192 31.464-.56 47.197-.776 12.022-.165 24.053-.18 36.081-.344a52.462 52.462 0 0 0 6.608-.653c1.948-.278 3.157-1.56 2.955-2.808a5.066 5.066 0 0 1-.034-1.375 8 8 0 0 1 .409-1.289 35.04 35.04 0 0 0-3.486-.343c-8.811-.017-17.636-.172-26.439.062-9.246.247-18.483.202-27.722.302-21.137.23-42.271.481-63.404.756-5.214.072-10.42.371-15.625.608-1.346.069-2.68.22-3.981.454-2.874.502-4.255 1.719-4.363 3.623.013.305-.028.587-.06.972Zm139.394-1.405.002-.234h1.556l-.003.282-1.555-.048Zm.222-3.88c.693 1.24.693 1.24-.489 1.192.134-.399.3-.797.461-1.193h.028Zm-37.929-.513-.112-.168h2.701l-.002.168h-2.587Zm-.928 2.23-.082.114h-1.432l.002-.113h1.512ZM142.938.79l.089.19h-2.026l.003-.19h1.934Z'/></svg>")
        no-repeat center;
      background-size: 100% 100%;
      color: currentColor; /* SVG uses currentColor for the fill */
    }
  }
`;
