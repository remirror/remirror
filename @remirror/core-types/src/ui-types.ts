import { css, SerializedStyles } from '@emotion/core';
import { ResponsiveStyleValue, SystemStyleObject, ThemeValue } from '@styled-system/css';
import {
  BorderProperty,
  BorderRadiusProperty,
  BorderWidthProperty,
  BoxShadowProperty,
  ColorProperty,
  FontFamilyProperty,
  FontSizeProperty,
  FontWeightProperty,
  HeightProperty,
  LetterSpacingProperty,
  LineHeightProperty,
  LineStyle,
  WidthProperty,
  ZIndexProperty,
} from 'csstype';
import { StringKey } from './base-types';

export type RemirrorThemeColorMode = {
  /**
   * This is required for a color mode.
   */
  text: ColorProperty;

  /**
   * This is required for the color mode.
   */
  background: ColorProperty;
} & Record<string, ColorProperty>;

export interface RemirrorThemeColorModes {
  /**
   * Nested color modes can provide overrides when used in conjunction with
   * `Theme.initialColorMode and `useColorMode()`
   */
  modes?: Record<string, RemirrorThemeColorMode>;
}

/**
 * The interface for the RemirrorThemeColors.
 *
 *
 * @remarks
 *
 * This interface allows for declaration merging.
 *
 * ```ts
 * declare module '@remirror/ui' {
 *   interface RemirrorThemeVariants {
 *     customColor: 'pink'
 *   };
 * }
 * ```
 */
export interface RemirrorThemeColor {
  /**
   * Body background color
   */
  background: ColorProperty;

  /**
   * Body foreground color
   */
  text: ColorProperty;

  /**
   * Primary brand color for links, buttons, etc.
   */
  primary?: ColorProperty;

  /**
   * A secondary brand color for alternative styling
   */
  secondary?: ColorProperty;

  /**
   * A faint color for backgrounds, borders, and accents that do not require
   * high contrast with the background color
   */
  muted?: ColorProperty;

  /**
   * A contrast color for emphasizing UI
   */
  accent?: ColorProperty;
}

/**
 * The interface for the standard properties that make up a `RemirrorTheme`.
 */
export interface RemirrorThemeProperties {
  /**
   * The name of the default color mode.
   *
   * This mode should not be named in the colors.modes. It is basically
   * a name given to what is the default colors defined for this theme.
   */
  initialColorMode: string;

  /**
   * Define the breakpoints for your theme to allow responsive styling via an array
   * on any style prop.
   *
   * Takes a mobile first approach and should be defined from the smallest device size to the largest.
   */
  breakpoints?: string[] | number[];
  colors: RemirrorThemeColor & RemirrorThemeColorModes & Record<string, any>;
  space?: ThemeValue<number | string>;
  fonts?: ThemeValue<FontFamilyProperty>;
  fontSizes?: Array<FontSizeProperty<number>>;
  fontWeights?: ThemeValue<FontWeightProperty>;
  lineHeights?: ThemeValue<LineHeightProperty<string>>;
  letterSpacings?: ThemeValue<LetterSpacingProperty<string>>;
  borders?: ThemeValue<BorderProperty<{}>>;
  borderWidths?: ThemeValue<BorderWidthProperty<{}>>;
  borderStyles?: ThemeValue<LineStyle>;
  radii?: ThemeValue<BorderRadiusProperty<{}>>;
  shadows?: ThemeValue<BoxShadowProperty>;
  zIndices?: ThemeValue<ZIndexProperty>;
  sizes?: ThemeValue<HeightProperty<{}> | WidthProperty<{}>>;
  styles: RemirrorThemeStyles & Record<string, WithVariants<SxThemeProp>>;
}

export interface RemirrorThemeStyles {
  /**
   * The styles for the main editor.
   */
  'remirror:editor'?: WithVariants<SxThemeProp>;
}

export interface RemirrorThemeVariants {
  /**
   * The UI variants for the remirror buttons. These can be extended.
   */
  'remirror:buttons': {
    default: WithVariants<SxThemeProp>;
    primary: WithVariants<SxThemeProp>;
    secondary: WithVariants<SxThemeProp>;
    /**
     * A button that blends in with the background.
     */
    background: WithVariants<SxThemeProp>;
  };

  /**
   * The UI variants for the remirror icons.
   */
  'remirror:icons': {
    default: WithVariants<SxThemeProp>;
    inverse: WithVariants<SxThemeProp>;
  };

  'remirror:text': {
    body: WithVariants<SxThemeProp>;
    h1: WithVariants<SxThemeProp>;
    h2: WithVariants<SxThemeProp>;
    h3: WithVariants<SxThemeProp>;
    h4: WithVariants<SxThemeProp>;
    h5: WithVariants<SxThemeProp>;
    h6: WithVariants<SxThemeProp>;
    label: WithVariants<SxThemeProp>;
    caption: WithVariants<SxThemeProp>;
  };
}

export type KeyOfThemeVariant<GKey extends StringKey<RemirrorThemeVariants>> = StringKey<
  RemirrorThemeVariants[GKey]
>;

export type RemirrorTheme = RemirrorThemeProperties & Partial<RemirrorThemeVariants> & { [key: string]: any };

/**
 * This prop allows for deeper nesting of styles within media queries and tags.
 */
export type SxThemeProp = SystemStyleObject &
  Record<
    string,
    | SystemStyleObject
    | ResponsiveStyleValue<number | string>
    | Record<string, SystemStyleObject | ResponsiveStyleValue<number | string> | undefined | null>
    | undefined
    | null
  >;

/**
 * Adds a variant property to the object.
 *
 * This is used with the `SxThemeProp` and allow a user to
 * configure the variant to use for the active style.
 */
export type WithVariants<GObject extends object> = GObject & { variant?: string };

export interface RemirrorThemeContextType {
  /**
   * Get a property from the active theme by it's path.
   *
   * @param path - a string or array path to search within the theme
   * @param fallback - the value to use when no value found
   */
  get<GReturn = any>(path: string | Array<string | number>, fallback?: any): GReturn;

  /**
   * Access to the css method from within the remirror theme context
   */
  css: typeof css;

  /**
   * This is similar to the css method but an array of themed objects which
   * have all the `@styled-system/css` props available. All objects will be themed
   */
  sx(
    ...args: Array<RemirrorInterpolation | RemirrorInterpolation[]>
  ): (props?: RemirrorTheme | { theme: RemirrorTheme }) => SerializedStyles;

  /**
   * Like the sx prop except this directly returns an object.
   *
   * Useful for the times when you don't want to return a function
   */
  sxx(...args: Array<RemirrorInterpolation | RemirrorInterpolation[]>): SerializedStyles;

  /**
   * The currently active theme. If this is a deeply nested provider then it will extend
   * all parent context themes.
   */
  theme: RemirrorTheme;

  /**
   * The parent of the current theme when one exists.
   * If undefined then this is the **root** remirrorTheme.
   */
  parent?: RemirrorTheme;

  /**
   * The color mode being used in the child editors.
   */
  colorMode: string;

  /**
   * The list of available color modes.
   */
  colorModes: string[];

  /**
   * A method to set the color mode.
   */
  setColorMode(mode: string): void;
}

/**
 * An interface describing props that receive the remirror theme.
 */
export interface ThemeParams {
  /**
   * The remirror theme passed down through the react context.
   */
  theme: RemirrorTheme;
}

/**
 * A union of types which are acceptable inputs for styling within remirror.
 */
export type RemirrorInterpolation =
  | WithVariants<SxThemeProp>
  | ((theme?: RemirrorTheme | { theme: RemirrorTheme } | undefined) => WithVariants<SxThemeProp>)
  | undefined
  | null
  | false
  | string
  | SerializedStyles
  | Array<
      | WithVariants<SxThemeProp>
      | ((theme?: RemirrorTheme | { theme: RemirrorTheme } | undefined) => WithVariants<SxThemeProp>)
      | undefined
      | null
      | false
      | string
      | SerializedStyles
    >;
