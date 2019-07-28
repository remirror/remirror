import { css as serializeStyles, SerializedStyles } from '@emotion/core';
import { deepMerge, get, isArray, isFunction, isPlainObject, isString, Key } from '@remirror/core';
import { css } from '@styled-system/css';
import {
  RemirrorTheme,
  RemirrorThemeColorModes,
  RemirrorThemeContextType,
  RemirrorThemeStyles,
  SxThemeProp,
  ThemedProps,
  WithVariants,
} from './ui-types';

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

  const modes = get('colors.modes', theme, {}) as RemirrorThemeColorModes;

  return deepMerge(theme, { colors: get(mode, modes, {}) }) as RemirrorTheme;
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
 * Get the specific style key from the theme.
 */
export const getStyleFactory = (theme: RemirrorTheme) => (
  name: Key<RemirrorThemeStyles>,
): WithVariants<SxThemeProp> | undefined => get(['styles', name], theme);

/**
 * Checks whether an object passed is a serialized style
 */
export const isSerializedStyle = (val: unknown): val is SerializedStyles =>
  isPlainObject(val) && isString(val.name) && isString(val.styles);

/**
 * Return true when a theme prop exists on the value passed in.
 */
export const isThemedProps = (val: unknown): val is ThemedProps =>
  isPlainObject(val) && isPlainObject(val.theme);

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
  const theme = isThemedProps(props) ? props.theme : props;

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
