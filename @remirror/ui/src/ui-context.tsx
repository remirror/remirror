import { css, ThemeContext } from '@emotion/core';
import { Context, createContext } from 'react';
import { baseTheme } from './ui-theme';
import { RemirrorTheme, RemirrorThemeContextType } from './ui-types';
import { getColorModes, getFactory, getStyleFactory, sx } from './ui-utils';

/**
 * A noop function that mimics the css emotion call but renders no output.
 *
 * @remarks
 * This is useful for enabling the library user to switch off emotion when the requirement
 * is to only use CSS styles. The specificity of emotion class names makes this difficult.
 */
const cssNoOp: typeof css = () => undefined as any;

/**
 * A noop function that mimics the sx method but returns no output
 */
const sxNoOp: typeof sx = () => undefined as any;

/**
 * Provides access to the theme context
 */
export const EmotionThemeContext = ThemeContext as Context<RemirrorTheme>;

export const defaultRemirrorThemeValue: RemirrorThemeContextType = {
  __REMIRROR_THEME_ACTIVE__: false,
  theme: baseTheme,
  css,
  sx,
  get: getFactory(baseTheme),
  getStyle: getStyleFactory(baseTheme),
  colorMode: baseTheme.initialColorMode,
  colorModes: getColorModes(baseTheme),
  setColorMode: () => {},
};

export const withoutEmotionProps = {
  css: cssNoOp,
  sx: sxNoOp,
};
/**
 * Provides access to the styling methods from within the context tree.
 */
export const RemirrorThemeContext = createContext<RemirrorThemeContextType>(defaultRemirrorThemeValue);
