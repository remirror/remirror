import { css } from '@linaria/core';

export const EDITOR = css`
  &.ProseMirror {
    position: relative;
  }
`;

export const POSITIONER = css`
  position: absolute;
  min-width: 1px;
  min-height: 1px;
  pointer-events: none;
  user-select: none;
  cursor: none;
  z-index: -1;
`;

export const POSITIONER_WIDGET = css`
  width: 0;
  height: 0;
  position: absolute;
`;
