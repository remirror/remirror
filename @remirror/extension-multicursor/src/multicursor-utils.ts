import { keyframes } from '@emotion/core';

export const blink = (color: string) => keyframes`
  from, to {
    border-color: transparent;
  }
  50% {
    border-color: ${color};
  }
`;
