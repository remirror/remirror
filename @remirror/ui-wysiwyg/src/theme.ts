import DefaultStyled, { CreateStyled } from '@emotion/styled';
import { Cast } from '@remirror/core';

export const styled = Cast<CreateStyled<UIWysiwygTheme>>(DefaultStyled);
export type UIWysiwygTheme = typeof uiWysiwygTheme;

export const uiWysiwygTheme = {
  colors: {
    primary: '#1DA1F2',
    warn: '#FFAD1F',
    error: '#E0245E',
    border: 'rgba(0,0,0,0.2)',
    plain: '#657786',
    primaryBackground: '#E8F5FD',
    icon: '#aab8c2',
  },
  font: {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    size: '1em',
    weight: '400',
  },
};
