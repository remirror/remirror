import { EDITOR_CLASS_SELECTOR } from '@remirror/core-constants';
import { RemirrorTheme } from '@remirror/core-types';
import { HSL } from './ui-hsl';

const baseHue = 205;
const baseSaturation = 70;
const baseLightness = 50;
const primary = HSL.create([baseHue, baseSaturation, baseLightness]);
const hsl = {
  primary,
  secondary: primary.complement(),
  background: HSL.create([0, 0, 100]),
  text: HSL.create([baseHue, 5, 5]),
  grey: HSL.create([baseHue, 5, 80]),
  muted: HSL.create([baseHue, 97.5, 97.5]),
  light: HSL.create([baseHue, 5, 90]),
};

const str = (color: HSL, ...methods: Array<(color: HSL) => HSL>) =>
  methods.reduce((col, method) => method(col), color).toString();
const active = (color: HSL) => color.darken(10);
const hover = (color: HSL) => color.darken(5).saturate(9);

const colors: RemirrorTheme['colors'] = {
  text: str(hsl.text),
  background: str(hsl.background),
  primary: str(hsl.primary),
  'primary:button:hover': str(primary, hover),
  'primary:button:active': str(primary, active),
  secondary: str(hsl.secondary),
  'secondary:button:hover': str(hsl.secondary, hover),
  'secondary:button:active': str(hsl.secondary, active),
  muted: str(hsl.muted),
  grey: str(hsl.grey),
  default: str(hsl.grey),
  'default:button:hover': str(hsl.grey, hover),
  'default:button:active': str(hsl.grey, active),
  light: str(hsl.light),
  modes: {
    dark: {
      text: str(hsl.background),
      background: str(hsl.text.alpha(0.9)),
    },
  },
};

/**
 * This is the default theme used throughout the built in ui-components.
 */
export const baseTheme: RemirrorTheme = {
  initialColorMode: 'light',
  colors,
  space: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  sizes: [0, 4, 8, 16, 32, 64, 128, 256, 512],
  fonts: {
    body: 'system-ui, sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  radii: [0, 4, 8, 16, 32, 64, 128],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 600,
    bold: 700,
  },
  lineHeights: {
    base: 1,
    body: 1.5,
    heading: 1.125,
  },
  shadows: {
    buttons: '0 0 0 0 hsla(210, 6%, 14%, 0.15) inset',
    text: 'none',
  },

  'remirror:buttons': {
    default: {
      backgroundColor: 'light',
      minHeight: 3,
      color: 'text',
      fontFamily: 'body',
      verticalAlign: 'baseline',
      paddingY: 2,
      paddingX: 3,
      fontWeight: 'bold',
      borderRadius: 1,
      '&:hover': {
        backgroundColor: 'default:button:hover',
      },
      '&:active': {
        backgroundColor: 'default:button:active',
      },
    },
    primary: {
      variant: 'remirror:buttons.default',
      backgroundColor: 'primary',
      color: 'background',
      ':hover': {
        backgroundColor: 'primary:button:hover',
      },
      ':active': {
        backgroundColor: 'primary:button:active',
      },
    },
    secondary: {
      variant: 'remirror:buttons.default',
      backgroundColor: 'secondary',
      color: 'background',
      ':hover': {
        backgroundColor: 'secondary:button:hover',
      },
      ':active': {
        backgroundColor: 'secondary:button:active',
      },
    },
  },
  'remirror:icons': {
    default: {
      color: 'text',
      transition: 'all 0.2s',
      ':hover': {
        color: 'grey',
      },
      backgroundColor: 'background',
    },
    inverse: {
      variant: 'remirror:icons.default',
      color: 'background',
      backgroundColor: 'text',
      ':hover': {
        color: 'light',
      },
    },
  },
  styles: {
    'remirror:editor': {
      [EDITOR_CLASS_SELECTOR]: {
        caretColor: 'currentColor',
        wordWrap: 'break-word',
        overflowWrap: 'break-word',
        fontSize: 2,
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
