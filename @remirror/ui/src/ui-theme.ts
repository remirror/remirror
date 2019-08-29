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
// const fade = (amount: number) => (color: HSL) => color.fade(amount);
const alpha = (amount: number) => (color: HSL) => color.alpha(amount);

const colors: RemirrorTheme['colors'] = {
  text: str(hsl.text),
  background: str(hsl.background),
  'background:button:hover': str(hsl.background, hover),
  'background:button:active': str(hsl.background, active),
  primary: str(hsl.primary),
  'primary:button:hover': str(primary, hover),
  'primary:button:active': str(primary, active),
  secondary: str(hsl.secondary),
  'secondary:button:hover': str(hsl.secondary, hover),
  'secondary:button:active': str(hsl.secondary, active),
  muted: str(hsl.muted),
  grey: str(hsl.grey),
  'grey:fade': str(hsl.grey, alpha(20)),
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

const zIndices = {
  auto: 'auto',
  '0': 0,
  '10': 10,
  '20': 20,
  '30': 30,
  '40': 40,
  '50': 50,
} as const;

const letterSpacings = {
  tighter: '-0.05em',
  tight: '-0.025em',
  normal: '0',
  wide: '0.025em',
  wider: '0.05em',
  widest: '0.1em',
};

const baseLineHeights = {
  none: '1',
  tight: '1.25',
  snug: '1.375',
  normal: '1.5',
  relaxed: '1.625',
  loose: '2',
};

const heading = {
  fontFamily: 'heading',
  fontWeight: 'heading',
  lineHeight: 'heading',
  letterSpacings: 'wider',
  m: 0,
  mb: 1,
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
    body:
      'BlinkMacSystemFont,-apple-system,"Segoe UI",Roboto,Oxygen,Ubuntu,Cantarell,"Fira Sans","Droid Sans","Helvetica Neue",Helvetica,Arial,sans-serif',
    heading: 'inherit',
    monospace: 'Menlo, monospace',
  },
  zIndices,
  letterSpacings,
  radii: [0, 4, 8, 16, 32, 64, 128],
  fontSizes: [12, 14, 16, 20, 24, 32, 48, 64, 96],
  fontWeights: {
    body: 400,
    heading: 600,
    bold: 700,
  },
  lineHeights: {
    ...baseLineHeights,
    body: baseLineHeights.relaxed,
    heading: baseLineHeights.tight,
  },
  shadows: {
    buttons: '0 0 0 0 hsla(205, 6%, 14%, 0.15) inset',
    text: 'none',
    card: `${HSL.create([baseHue, baseSaturation, 15, 25])} 0 4px 8px -2px, ${HSL.create([
      baseHue,
      baseSaturation,
      15,
      31,
    ])} 0px 0px 1px`,
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
        ':hover': {
          backgroundColor: 'secondary:button:active',
        },
      },
    },
    background: {
      variant: 'remirror:buttons.default',
      backgroundColor: 'background',
      ':hover': {
        backgroundColor: 'background:button:hover',
      },
      ':active': {
        backgroundColor: 'background:button:active',
        ':hover': {
          backgroundColor: 'background:button:active',
        },
      },
    },
  },

  'remirror:icons': {
    default: {
      color: 'text',
      transition: 'all 0.2s',
      backgroundColor: 'background',
    },
    inverse: {
      variant: 'remirror:icons.default',
      color: 'background',
      backgroundColor: 'text',
    },
  },

  'remirror:text': {
    body: {
      fontSize: 'body',
      lineHeight: 'body',
      fontFamily: 'body',
      fontWeight: 'body',
      letterSpacings: 'wide',
    },
    caption: {},
    h1: {
      ...heading,
      fontSize: 6,
      mt: 2,
    },
    h2: {
      ...heading,
      fontSize: 5,
      mt: 2,
    },
    h3: {
      ...heading,
      fontSize: 4,
      mt: 3,
    },
    h4: {
      ...heading,
      fontSize: 3,
    },
    h5: {
      ...heading,
      fontSize: 2,
    },
    h6: {
      ...heading,
      fontSize: 1,
      mb: 2,
    },
    label: {},
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
