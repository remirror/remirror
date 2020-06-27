import { css } from 'linaria';
import colors from 'open-color';
import { DeepPartial, Shape } from '@remirror/core-types';
import { kebabCase } from 'case-anything';
import { invariant } from '@remirror/core-helpers';

declare global {
  namespace Remirror {
    /**
     * The interface for the remirror theme. It is declared in the global
     * namespace to allow you to extend and update the theme values that can be
     * provided.
     */
    interface Theme {
      color: ThemeColor;
      hue: ThemeHue;
      fontFamily: ThemeFontFamily;
      fontSize: ThemeFontSize;
      fontWeight: ThemeFontWeight;
      space: ThemeSpace;
      lineHeight: ThemeLineHeight;
      letterSpacing: ThemeLetterSpacing;
    }

    interface ThemeLineHeight {
      default: string;
      heading: string;
    }

    interface ThemeLetterSpacing {
      tight: string;
      default: string;
      space: string;
      wide: string;
    }

    interface ThemeFontWeight {
      default: string;
      heading: string;
      bold: string;
    }

    interface ThemeFontFamily {
      default: string;
      heading: string;
      mono: string;
    }

    interface ThemeSpace {
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
    }

    interface ThemeFontSize {
      0: string;
      1: string;
      2: string;
      3: string;
      4: string;
      5: string;
      6: string;
      7: string;
      8: string;
      default: string;
    }

    interface ThemeColor {
      white: Color;
      black: Color;
      primary: Color;
      secondary: Color;
      text: Color;
      background: Color;
      muted: Color;
    }

    interface ThemeHue {
      gray: Hue;
      red: Hue;
      pink: Hue;
      grape: Hue;
      violet: Hue;
      indigo: Hue;
      blue: Hue;
      cyan: Hue;
      teal: Hue;
      green: Hue;
      lime: Hue;
      yellow: Hue;
      orange: Hue;
    }
  }
}

type DeepString<Type> = Type extends object ? { [K in keyof Type]: DeepString<Type[K]> } : string;

/**
 * Aliased name for the color type. It's just a string.
 */
export type Color = string;

/**
 * A hue is a color split into ten hues.
 */
export type Hue = [Color, Color, Color, Color, Color, Color, Color, Color, Color, Color];

/**
 * The default remirror theme. This can be mutated with the
 * `mutateRemirrorTheme`.
 */
export const defaultRemirrorTheme: Remirror.Theme = {
  color: {
    black: '#000000',
    white: '#ffffff',
    text: '#252103',
    background: '#ffffff',
    primary: '#7963d2',
    secondary: '#bcd263',
    muted: colors.gray[1],
  },
  hue: {
    gray: colors.gray as Hue,
    red: colors.red as Hue,
    pink: colors.pink as Hue,
    grape: colors.grape as Hue,
    violet: colors.violet as Hue,
    indigo: colors.indigo as Hue,
    blue: colors.blue as Hue,
    cyan: colors.cyan as Hue,
    teal: colors.teal as Hue,
    green: colors.green as Hue,
    lime: colors.lime as Hue,
    yellow: colors.yellow as Hue,
    orange: colors.orange as Hue,
  },
  fontFamily: {
    default:
      'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", sans-serif',
    heading: 'inherit',
    mono: 'Menlo, monospace',
  },
  fontSize: {
    0: '12px',
    1: '14px',
    2: '16px',
    3: '20px',
    4: '24px',
    5: '32px',
    6: '48px',
    7: '64px',
    8: '96px',
    default: '16px',
  },
  space: {
    1: '4px',
    2: '8px',
    3: '16px',
    4: '32px',
    5: '64px',
    6: '128px',
    7: '256px',
    8: '512px',
  },
  fontWeight: {
    bold: '700',
    default: '400',
    heading: '700',
  },
  letterSpacing: {
    tight: '-1px',
    default: 'normal',
    space: '1px',
    wide: '3px',
  },
  lineHeight: {
    heading: '1.25em',
    default: '1.5em',
  },
};

function mapThemeToPropertyNames(): DeepString<Remirror.Theme> {
  const transformed: any = {};

  function updateTransformed(keys: string[], value: unknown, obj: Shape) {
    const focusedKey = keys[keys.length - 1];

    if (typeof value === 'string' || typeof value === 'number') {
      // This is intentionally duplicated due to an issue building with linaria
      // which is unable to find the `getName` function when used.
      obj[focusedKey] = `var(--rmr-${keys.map(kebabCase).join('-')})`;
    }

    if (!value || (!Array.isArray(value) && typeof value !== 'object')) {
      return;
    }

    obj[focusedKey] = {};

    for (const [key, v] of Object.entries(value as object)) {
      updateTransformed([...keys, key], v, obj[focusedKey]);
    }
  }

  for (const [key, value] of Object.entries(defaultRemirrorTheme)) {
    updateTransformed([key], value, transformed);
  }

  return transformed;
}

const themeVariables = mapThemeToPropertyNames();

/**
 * The Remirror Theme Type which can be extended by adding properties to the
 * global Remirror.Theme namespace.
 */
export type RemirrorThemeType = DeepPartial<Remirror.Theme>;

/**
 * Get the variable name from the keys in the theme object.
 */
function getName(keys: string[]) {
  return `--rmr-${keys.map(kebabCase).join('-')}`;
}

function keyCapturingProxy<Type extends object>(getter: (obj: Type) => string): string[] {
  const keys: string[] = [];

  function createProxy(obj: any): Type {
    return new Proxy(obj, {
      get: (target, key) => {
        keys.push(key as string);
        return createProxy({});
      },
    });
  }

  getter(createProxy({}));

  return keys;
}

/**
 * Get the theme custom property.
 */
export function getTheme(getter: (theme: DeepString<Remirror.Theme>) => string): string {
  return `var(--rmr-${keyCapturingProxy(getter).map(kebabCase).join('-')})`;
}

/**
 * Create the theme variables from the provided theme.
 *
 * This function can't use anything from `@remirror/core-helpers` due to being
 * used in the `themeStyles` css. Babel can't resolve the imported functions in
 * development.
 */
export function createThemeVariables(theme: RemirrorThemeType = {}): string {
  const cssVariables: string[] = [];

  function addCssVariable(keys: string[], value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      cssVariables.push(`${getName(keys)}: ${value};`);

      return;
    }

    if (value && (Array.isArray(value) || typeof value === 'object')) {
      for (const [key, v] of Object.entries(value as object)) {
        addCssVariable([...keys, key], v);
      }

      return;
    }
  }

  for (const [key, value] of Object.entries(theme)) {
    addCssVariable([key], value);
  }

  return cssVariables.join('\n');
}

/**
 * The class name for adding theme styles to the remirror editor.
 *
 * These are the variable names
 */
export const themeStyles = css`
  ${createThemeVariables(defaultRemirrorTheme)}

  font-family: ${getTheme((t) => t.fontFamily.default)};
  line-height: ${getTheme((t) => t.lineHeight.default)};
  font-weight: ${getTheme((t) => t.fontWeight.default)};

  h1,h2,h3,h4,h5,h6 {
    color: ${getTheme((t) => t.color.text)};
    font-family: ${getTheme((t) => t.fontFamily.heading)};
    line-height: ${getTheme((t) => t.lineHeight.heading)};
    font-weight: ${getTheme((t) => t.fontWeight.heading)};
  }

  h1 {
    font-size: ${getTheme((t) => t.fontSize[5])};
  }

  h2 {
    font-size: ${getTheme((t) => t.fontSize[4])};
  }

  h3 {
    font-size: ${getTheme((t) => t.fontSize[3])};
  }

  h4 {
    font-size: ${getTheme((t) => t.fontSize[2])};
  }

  h5 {
    font-size: ${getTheme((t) => t.fontSize[1])};
  }

  h6 {
    font-size: ${getTheme((t) => t.fontSize[0])};
  }
`;
