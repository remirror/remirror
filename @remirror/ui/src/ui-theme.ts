import { EDITOR_CLASS_SELECTOR } from '@remirror/core';
import { RemirrorTheme } from './ui-types';

/**
 * This is the default theme used throughout the built in ui-components.
 */
export const baseTheme: RemirrorTheme = {
  initialColorMode: 'light',
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 600,
    bold: 700,
  },
  lineHeights: {
    body: 1.5,
    heading: 1.125,
  },
  colors: {
    text: '#000',
    background: '#fff',
    primary: '#11e',
    secondary: '#c0c',
    highlight: '#e0e',
    muted: '#f6f6ff',
    dark: '#222',
    gray: '#999',
    light: '#ddd',
    modes: {
      dark: {
        text: '#fff',
        background: '#000',
        primary: '#0fc',
        secondary: '#0cf',
        highlight: '#f0c',
        muted: '#011',
      },
    },
  },
  components: {
    'icon:simple': {
      color: 'dark',
      transition: 'all 0.2s',
      ':hover': {
        color: 'gray',
      },
    },
  },
  styles: {
    'remirror:editor': {
      [EDITOR_CLASS_SELECTOR]: {
        caretColor: 'currentColor',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
      },
      [`${EDITOR_CLASS_SELECTOR}:focus`]: {
        outline: 'none',
      },
      [`${EDITOR_CLASS_SELECTOR}[contenteditable="false"]`]: {
        whiteSpace: 'normal',
      },
      [`${EDITOR_CLASS_SELECTOR}[contenteditable="true"]`]: {
        whiteSpace: 'pre-wrap',
      },
    },
  },
};
