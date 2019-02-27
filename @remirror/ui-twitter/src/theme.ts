import DefaultStyled, { CreateStyled } from '@emotion/styled';
import { Cast } from '@remirror/core';

export const styled = Cast<CreateStyled<UITwitterTheme>>(DefaultStyled);
export type UITwitterTheme = typeof uiTwitterTheme;

export const uiTwitterTheme = {
  colors: {
    primary: '#1DA1F2',
    warn: '#FFAD1F',
    error: '#E0245E',
    border: '#99CFEB',
    plain: '#657786',
    primaryBackground: '#E8F5FD',
  },
};
