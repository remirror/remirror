import { EDITOR_CLASS_SELECTOR, RemirrorTheme } from '@remirror/core';
import { ButtonState } from './wysiwyg-types';

export const buttonColors: Record<ButtonState, string> = {
  default: '#aaa',
  'active-default': 'black',
  inverse: '#aaa',
  'active-inverse': 'white',
};

export const wysiwygEditorTheme: RemirrorTheme = {
  initialColorMode: 'light',
  colors: {
    primary: '#1DA1F2',
    background: '#fff',
    text: '#000',
    warn: '#FFAD1F',
    error: '#E0245E',
    border: 'rgba(0,0,0,0.2)',
    plain: '#657786',
    primaryBackground: '#E8F5FD',
    selected: '#F5F8FA',
    icon: '#aab8c2',
  },
  styles: {
    'remirror:editor': {
      height: '100%',
      [`${EDITOR_CLASS_SELECTOR} p`]: {
        margin: 0,
        letterSpacing: '0.6px',
        color: 'text',
      },
      [`${EDITOR_CLASS_SELECTOR} p em`]: {
        letterSpacing: '1.2px',
      },
      [`${EDITOR_CLASS_SELECTOR} a`]: {
        textDecoration: 'none',
        color: 'primary',
      },
      [`${EDITOR_CLASS_SELECTOR} a.mention`]: {
        pointerEvents: 'none',
        cursor: 'default',
      },
      [`${EDITOR_CLASS_SELECTOR}:focus`]: {},
      [EDITOR_CLASS_SELECTOR]: {
        boxSizing: 'border-box',
        position: 'relative',
        lineHeight: '1.6em',
        width: '100%',
        fontSize: 2,
        minHeight: '142px',
        padding: 2,
        paddingRight: 0,
        fontWeight: 'body',
      },
      [`${EDITOR_CLASS_SELECTOR} .ProseMirror-selectednode`]: {
        backgroundColor: 'selected',
      },
    },
  },
};
