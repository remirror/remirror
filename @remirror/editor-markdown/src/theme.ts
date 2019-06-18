import DefaultStyled, { CreateStyled } from '@emotion/styled';
import { Cast } from '@remirror/core';

export const styled = Cast<CreateStyled<MarkdownEditorTheme>>(DefaultStyled);
export type MarkdownEditorTheme = typeof uiMarkdownTheme;

export type ButtonState = 'default' | 'active-default' | 'inverse' | 'active-inverse';

const buttonColors: Record<ButtonState, string> = {
  default: '#aaa',
  'active-default': 'black',
  inverse: '#aaa',
  'active-inverse': 'white',
};

export const uiMarkdownTheme = {
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
    size: '1em',
    weight: '400',
  },
  button: {
    color: buttonColors,
  },
};
