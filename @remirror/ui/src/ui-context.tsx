import { css, ThemeContext } from '@emotion/core';
import { RemirrorTheme, RemirrorThemeContextType } from '@remirror/core-types';
import { Context, createContext } from 'react';
import { baseTheme } from './ui-theme';
import { getColorModes, getFactory, sx } from './ui-utils';

/**
 * A noop function that mimics the css emotion call but renders no output.
 *
 * @remarks
 * This is useful for enabling the library user to switch off emotion when the requirement
 * is to only use CSS styles. The specificity of emotion class names makes this difficult.
 */
const cssNoOp = () => undefined as any;

/**
 * Provides access to the theme context
 */
export const EmotionThemeContext = ThemeContext as Context<RemirrorTheme>;

export const defaultRemirrorThemeValue: RemirrorThemeContextType = {
  theme: baseTheme,
  css,
  sx,
  sxx: cssNoOp,
  get: getFactory(baseTheme),
  colorMode: baseTheme.initialColorMode,
  colorModes: getColorModes(baseTheme),
  setColorMode: () => {},
};

export const withoutEmotionProps: Pick<RemirrorThemeContextType, 'css' | 'sx'> = {
  css: cssNoOp,
  sx: cssNoOp,
};
/**
 * Provides access to the styling methods from within the context tree.
 */
export const RemirrorThemeContext = createContext<RemirrorThemeContextType>(defaultRemirrorThemeValue);
