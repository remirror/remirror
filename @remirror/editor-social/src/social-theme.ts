import { EDITOR_CLASS_SELECTOR, RemirrorTheme } from '@remirror/core';
import { baseTheme } from '@remirror/ui';

const colors = {
  background: '#fff',
  text: '#000',
  primary: '#1DA1F2',
  warn: '#FFAD1F',
  error: '#E0245E',
  border: '#99CFEB',
  plain: '#657786',
  primaryBackground: '#E8F5FD',
  selected: '#F5F8FA',
  icon: '#aab8c2',
};

export const socialEditorTheme: RemirrorTheme = {
  ...baseTheme,
  initialColorMode: 'light',
  colors,
  fonts: {
    body: '"Helvetica Neue", Helvetica, Arial, sans-serif',
    heading: 'inherit',
  },
  shadows: {
    default: `0 0 0 1px ${colors.border}`,
  },
  components: {},
  styles: {
    'remirror:editor': {
      [EDITOR_CLASS_SELECTOR]: {
        flexGrow: 1,
        display: 'flex',
        flexDirection: 'column',
        overflowY: 'scroll',
        boxSizing: 'border-box',
        position: 'relative',
        borderWidth: '1px',
        borderStyle: 'solid',
        borderColor: 'border',
        boxShadow: 'default',
        lineHeight: 'relaxed',
        borderRadius: '8px',
        width: '100%',
        fontFamily: 'body',
        fontSize: 2,
        maxHeight: 'calc(90vh - 124px)',
        minHeight: '142px',
        padding: '8px',
        paddingRight: '40px',
      },
      [`${EDITOR_CLASS_SELECTOR} p`]: {
        margin: 0,
        letterSpacing: '0.6px',
        color: 'text',
      },
      [`${EDITOR_CLASS_SELECTOR} a.mention`]: {
        pointerEvents: 'none',
        cursor: 'default',
      },
      [`${EDITOR_CLASS_SELECTOR} a`]: {
        textDecoration: 'none !important',
        color: 'primary',
      },
      [`${EDITOR_CLASS_SELECTOR}:focus`]: {
        outline: 'none',
        boxShadow: 'focus',
      },
      [`${EDITOR_CLASS_SELECTOR} .Prosemirror-selectednode`]: {
        backgroundColor: 'selected',
      },
    },
  },
};
