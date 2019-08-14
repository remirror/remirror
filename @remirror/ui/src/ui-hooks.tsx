import { RemirrorTheme, RemirrorThemeContextType } from '@remirror/core';
import { useContext } from 'react';
import { EmotionThemeContext, RemirrorThemeContext } from './ui-context';
/**
 * A hook for pulling the remirror theme from the react context.
 */
export const useRemirrorTheme = (): RemirrorThemeContextType => useContext(RemirrorThemeContext);
/**
 * A hook which returns the current remirror theme from the emotion context.
 *
 * If no theme exists it uses the default `baseTheme`.
 */
export const useEmotionTheme = (): RemirrorTheme => useContext(EmotionThemeContext) || {};
