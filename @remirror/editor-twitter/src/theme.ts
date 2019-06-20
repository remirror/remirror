import DefaultStyled, { CreateStyled } from '@emotion/styled';
import { Cast, EDITOR_CLASS_SELECTOR } from '@remirror/core';

export const styled = Cast<CreateStyled<TwitterEditorTheme>>(DefaultStyled);
export type TwitterEditorTheme = typeof twitterEditorTheme;

export const twitterEditorTheme = {
  colors: {
    primary: '#1DA1F2',
    warn: '#FFAD1F',
    error: '#E0245E',
    border: '#99CFEB',
    plain: '#657786',
    primaryBackground: '#E8F5FD',
    icon: '#aab8c2',
  },
  font: {
    family: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    size: '1em',
    weight: '400',
  },
  editorStyles: {
    [EDITOR_CLASS_SELECTOR]: {
      width: '100%',
      height: '100%',
    },
  },
};
