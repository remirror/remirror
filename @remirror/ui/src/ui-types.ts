import { css } from '@emotion/core';
import { SerializedStyles } from '@emotion/serialize';
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
  components: RemirrorThemeComponentVariants & Record<string, SxThemeProp>;
}

export interface RemirrorThemeComponentVariants {
  /**
   * Styles for the simple icon which is an icon on top of a background and
   * can be inverted.
   */
  'icon:simple'?: WithVariants<SxThemeProp>;
}

export type RemirrorTheme = RemirrorThemeProperties &
  RemirrorThemeVariants & { [key: string]: ThemeValue<any> | string };

/**
 * This prop allows for deeper nesting of styles within media queries and tags.
 */
export type SxThemeProp = SystemStyleObject &
  Record<
    string,
    | SystemStyleObject
    | ResponsiveStyleValue<number | string>
    | Record<string, SystemStyleObject | ResponsiveStyleValue<number | string>>
  >;

/**
 * Adds a variant property to the object.
 *
 * This is used with the `SxThemeProp` and allow a user to
 * configure the variant to use for the active style.
 */
export type WithVariants<GObject extends {}> = GObject & { variant?: string };

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
   * The currently active theme. If this is a deeply nested provider then it will extend
   * all parent context themes.
   */
  theme: RemirrorTheme;

  /**
   * The parent of the current theme when one exists.
   */
  parent?: RemirrorTheme;

  /**
   * Retrieve the style of any defined object under the `styles` attribute from within the theme.
   */
  getStyle(key: keyof RemirrorThemeStyles): WithVariants<SxThemeProp> | undefined;

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

  /**
   * This is true when there is already an active remirror theme available at the root.
   *
   * @default false
   */
  __REMIRROR_THEME_ACTIVE__: boolean;
}

/**
 * An interface describing props that receive the remirror theme.
 */
export interface ThemedProps {
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
  | ((theme?: RemirrorTheme | { theme: RemirrorTheme }) => WithVariants<SxThemeProp>)
  | undefined
  | null
  | string
  | SerializedStyles
  | Array<
      | WithVariants<SxThemeProp>
      | ((theme?: RemirrorTheme | { theme: RemirrorTheme }) => WithVariants<SxThemeProp>)
      | undefined
      | null
      | string
      | SerializedStyles
    >;
