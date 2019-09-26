import { css as serializeStyles, SerializedStyles } from '@emotion/core';
import { deepMerge, get, isArray, isFunction, isPlainObject, isString } from '@remirror/core-helpers';
import {
  RemirrorTheme,
  RemirrorThemeContextType,
  SxThemeProp,
  ThemeParams,
  WithVariants,
} from '@remirror/core-types';
import { css } from '@styled-system/css';

/**
 * Applies the selected color mode to the theme.
 *
 * Taken from https://github.com/system-ui/theme-ui/blob/7a92518ee0e71aaf42a3115b102254b50d16683d/packages/theme-ui/src/provider.js#L14-L20
 *
 * @param theme - the theme
 * @param mode - the color mode to apply to the theme
 */
export const applyColorMode = (theme: RemirrorTheme, mode: string): RemirrorTheme => {
  if (!mode) {
    return theme;
  }

  const modes = get('colors.modes', theme, {});

  return deepMerge(theme, { colors: get(mode, modes, {}) });
};

/**
 * Get the color modes available on this theme.
 */
export const getColorModes = (theme: RemirrorTheme) => Object.keys(get('colors.modes', theme, {}));

/**
 * Creates a path getter for the provided theme.
 */
export const getFactory = (theme: RemirrorTheme) => <GReturn = any>(
  path: string | Array<string | number>,
  fallback?: any,
): GReturn => get(path, theme, fallback);

/**
 * Checks whether an object passed is a serialized style
 */
export const isSerializedStyle = (val: unknown): val is SerializedStyles =>
  isPlainObject(val) && isString(val.name) && isString(val.styles);

/**
 * Return true when a theme prop exists on the value passed in.
 */
export const hasThemeProp = (val: unknown): val is ThemeParams =>
  isPlainObject(val) && isPlainObject(val.theme);

const getTheme = (
  props:
    | RemirrorTheme
    | {
        theme: RemirrorTheme;
      }
    | undefined,
): RemirrorTheme | undefined => (hasThemeProp(props) ? props.theme : props);

/**
 * A wrapper around the `@styled-system/css` for composing multiple themed
 * styles together in the `css` prop.
 *
 * ```tsx
 * const Component = () => {
 *   const { sx, css } = useRemirrorTheme();
 *   const stringStyles = css`
 *     font-weight: bold;
 *   `;
 *
 *   return <div css={sx({ variant: 'simple' }, stringStyles)} />;
 * };
 * ```
 */
export const sx: RemirrorThemeContextType['sx'] = (...styles) => props => {
  const theme = getTheme(props);

  return serializeStyles(
    styles.map(style =>
      isArray(style)
        ? sx(...style)(theme)
        : isFunction(style)
        ? css(style(theme))(theme)
        : isSerializedStyle(style)
        ? style
        : isPlainObject(style)
        ? css(style as WithVariants<SxThemeProp>)(theme)
        : style,
    ),
  );
};

export const cssValueUnits = (val: unknown): string | undefined =>
  isString(val) ? val.replace(/[0-9 ]+/g, '') : undefined;

/**
 * Transforms a number to
 */
export const numberToPixels = (val: number | string): string =>
  cssValueUnits(val) ? `${val}`.replace(/ /g, '') : `${val}px`;
