import { kebabCase } from 'case-anything';
import colors from 'open-color';

import type { DeepPartial, DeepString } from '@remirror/core-types';

/**
 * Aliased name for the color type. It's just a string.
 */
export type Color = string;

/**
 * A hue is a color split into ten hues.
 */
export type Hue = [Color, Color, Color, Color, Color, Color, Color, Color, Color, Color];

/**
 * The Remirror Theme Type which can be extended by adding properties to the
 * global Remirror.Theme namespace.
 */
export type RemirrorThemeType = DeepPartial<Remirror.Theme>;

/**
 * The Remirror atom type which can be extended by adding properties to the
 * global Remirror.Atom namespace.
 */
export type RemirrorAtomType = DeepPartial<Remirror.Atom>;

/**
 * Get the remirror variable from the keys to access it in the them object.
 */
function getCustomPropertyName(keys: string[]) {
  return `--remirror-${keys.map(kebabCase).join('-')}`;
}

/**
 * Get the custom property from the keys used to access it in the theme object.
 */
function getVar(keys: string[]) {
  return `var(${getCustomPropertyName(keys)})`;
}

function keyCapturingProxy<Type extends object>(getter: (obj: Type) => string): string[] {
  const keys: string[] = [];

  function createProxy(obj: any): Type {
    /**
     * Track the number of times this has been called. This proxy only supports
     * simple getters which access the keys only without any extra functionality.
     */
    let called = false;

    return new Proxy(obj, {
      get: (_, key) => {
        if (called) {
          throw new Error(`Must only access the key once. ${key.toString()}`);
        }

        called = true;
        keys.push(key as string);
        return createProxy({});
      },

      set: (_, key) => {
        throw new Error(`Setters are not allowed for this object. ${key.toString()}`);
        // invariant(false, { message: `Setters are not allowed for this object. ${key.toString()}` });
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
  return getVar(keyCapturingProxy(getter));
}

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
    shadow1: 'rgba(10,31,68,0.08)',
    shadow2: 'rgba(10,31,68,0.10)',
    shadow3: 'rgba(10,31,68,0.12)',
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
    loose: '1px',
    wide: '3px',
  },
  lineHeight: {
    heading: '1.25em',
    default: '1.5em',
  },
};

export interface CreateThemeVariablesReturn {
  /**
   * A css string of the variables.
   */
  css: string;

  /**
   * A styles object version of the created css.
   */
  styles: Record<string, string | number>;
}

/**
 * Create the theme variables from the provided theme.
 *
 * This function can't use anything from `@remirror/core-helpers` due to being
 * used in the `themeStyles` css. Babel can't resolve the imported functions in
 * development.
 */
export function createThemeVariables(theme: RemirrorThemeType = {}): CreateThemeVariablesReturn {
  const cssVariableString: string[] = [];
  const cssVariableObject: Record<string, string | number> = {};

  function addCssVariable(keys: string[], value: unknown) {
    if (typeof value === 'string' || typeof value === 'number') {
      cssVariableString.push(`${getCustomPropertyName(keys)}: ${value};`);
      cssVariableObject[getCustomPropertyName(keys)] = value;

      return;
    }

    if (typeof value !== 'object' || !value) {
      return;
    }

    for (const [key, v] of Object.entries(value)) {
      addCssVariable([...keys, key], v);
    }

    return;
  }

  for (const [key, value] of Object.entries(theme)) {
    addCssVariable([key], value);
  }

  return { css: cssVariableString.join('\n'), styles: cssVariableObject };
}

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

    interface ThemeShadow {
      0: ThemeShadowItem;
      1: ThemeShadowItem;
      2: ThemeShadowItem;
      3: ThemeShadowItem;
      4: ThemeShadowItem;
      5: ThemeShadowItem;
    }

    interface ThemeShadowItem {
      x: string | number;
      y: string | number;
      blur: string | number;
      scale: string | number;
    }

    interface ThemeLineHeight {
      default: string | number;
      heading: string | number;
    }

    interface ThemeLetterSpacing {
      tight: string | number;
      default: string | number;
      loose: string | number;
      wide: string | number;
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
      1: string | number;
      2: string | number;
      3: string | number;
      4: string | number;
      5: string | number;
      6: string | number;
      7: string | number;
      8: string | number;
    }

    interface ThemeFontSize {
      0: string | number;
      1: string | number;
      2: string | number;
      3: string | number;
      4: string | number;
      5: string | number;
      6: string | number;
      7: string | number;
      8: string | number;
      default: string | number;
    }

    interface ThemeColor {
      white: Color;
      black: Color;
      primary: Color;
      secondary: Color;
      text: Color;
      background: Color;
      muted: Color;
      shadow1: Color;
      shadow2: Color;
      shadow3: Color;
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

    /**
     * Atoms which are translated to class names.
     *
     * The atoms can be added to
     */
    interface Atom {
      shadow: AtomShadow;
    }

    interface AtomShadow {
      bottom1: string[];
      bottom2: string[];
      bottom3: string[];
      bottom4: string[];
      bottom5: string[];
      top1: string[];
      top2: string[];
      top3: string[];
      top4: string[];
      top5: string[];
      center1: string[];
      center2: string[];
      center3: string[];
      center4: string[];
      center5: string[];
      right1: string[];
      right2: string[];
      right3: string[];
      right4: string[];
      right5: string[];
      left1: string[];
      left2: string[];
      left3: string[];
      left4: string[];
      left5: string[];
    }
  }
}
