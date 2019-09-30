import { bool, deepMerge, isFunction } from '@remirror/core-helpers';
import { RemirrorTheme, RemirrorThemeContextType } from '@remirror/core-types';
import { ThemeProvider as EmotionThemeProvider } from 'emotion-theming';
import React, { FC, ReactElement, useMemo, useState } from 'react';
import { defaultRemirrorThemeValue, RemirrorThemeContext, withoutEmotionProps } from './ui-context';
import { useEmotionTheme, useRemirrorTheme } from './ui-hooks';
import { applyColorMode, getColorModes, getFactory } from './ui-utils';

type DisableMerge = 'parent' | 'base' | 'emotion';

export interface RemirrorThemeProviderProps {
  /**
   * Removes the emotion injected styles from the component.
   *
   * @remarks
   *
   * This is accomplished by making the `css` function a noop. It is useful for
   * those who would prefer not to use a CSS-in-JS solution. Emotion classes are
   * very hard to override once in place. By setting this to true, it should be
   * much easier to configure your own styles without the burden of overriding
   * existing styles.
   *
   * @defaultValue `false`
   */
  withoutEmotion?: boolean;
  /**
   * The theme being passed into the context.
   *
   * This can either be an object or a function that takes the currentTheme
   * or a default theme when this is the root as the only parameter. It must
   * return a valid `RemirrorTheme`
   */
  theme: Partial<RemirrorTheme> | ((currentTheme: RemirrorTheme) => RemirrorTheme);
  /**
   * The initial color mode that will be used when the app is first loaded.
   *
   * It is up to you to decide how this can be persisted between sessions. For example
   * if a user switches to dark mode then reloads the page their settings would be lost.
   *
   * To prevent this you could:
   * - store the mode in local storage and set the color mode to reflect this
   *   - With SSR this will always lead to a flash of unstyled content since the color mode can only be retrieved once the DOM loads
   * - store the mode in a cookie session and render the app with this color mode set from the server session.
   *
   * @defaultValue `baseTheme.initialColorMode`
   */
  initialColorMode?: string;
  /**
   * All providers must have ONE child element.
   */
  children: ReactElement;

  /**
   * By default the theme provided by this component will be merged with a parent
   * RemirrorTheme or, in the case of the root theme, with the `baseTheme` and outer
   * emotion theme.
   *
   * Set this to true to disable merging and hence to cause the theme provided to
   * be the only theme used for all nested components.
   *
   * Set this to an array of values to disable against
   *
   * - parent - disable merging with the ancestors
   * - base - disable root providers merging with the base theme
   * - emotion - disable merging with any outer emotion themes
   *
   * @defaultValue `[]`
   */
  disableMerge?: DisableMerge[];
}

/**
 * Check whether the theme has a parent.
 */
const hasParent = (
  theme: RemirrorThemeContextType,
): theme is RemirrorThemeContextType & { parent: RemirrorTheme } => bool(theme.parent);

/**
 * When true this is the outermost remirror theme in the component tree.
 *
 * Since RemirrorThemeProvider's support nesting it is necessary to check so
 * that inner themes can be safely merged into the outer theme values.
 */
const isRoot = (theme: RemirrorThemeContextType) => !hasParent(theme);

/**
 * A component that either extends the existing emotion theme with the provided theme
 * or it creates a new theme context for all children components nested in the tree.
 *
 * @remarks
 *
 * Supports nested themes.
 */
export const RemirrorThemeProvider: FC<RemirrorThemeProviderProps> = ({
  theme: themeProp,
  children,
  withoutEmotion = false,
  disableMerge = [],
  initialColorMode,
}) => {
  const disableMergeWithParent = disableMerge.includes('parent');
  const disableMergeWithBase = disableMerge.includes('base');
  const disableMergeWithEmotion = disableMerge.includes('emotion');

  const outer = useRemirrorTheme();
  const emotionTheme = useEmotionTheme();
  const [colorMode, setColorMode] = useState(initialColorMode || outer.colorMode);

  const parentEmotionTheme = isRoot(outer) && !disableMergeWithEmotion ? emotionTheme : {};
  const parent = disableMergeWithParent
    ? hasParent(outer)
      ? outer.parent
      : Object.create(null)
    : isRoot(outer) && disableMergeWithBase
    ? Object.create(null)
    : outer.theme;

  const themeWithoutColorMode: RemirrorTheme = deepMerge(
    parentEmotionTheme,
    parent,
    isFunction(themeProp) ? themeProp(parent) : themeProp,
  );
  const theme = applyColorMode(themeWithoutColorMode, colorMode);

  const [get, colorModes] = useMemo(() => [getFactory(theme), getColorModes(theme)], [theme]);

  const value = {
    ...defaultRemirrorThemeValue,
    ...(withoutEmotion
      ? withoutEmotionProps
      : {
          sxx: (...args: Parameters<typeof defaultRemirrorThemeValue.sx>) =>
            defaultRemirrorThemeValue.sx(...args)(theme),
        }),

    parent,
    theme,
    get,
    colorMode,
    colorModes,
    setColorMode,
  };

  return (
    <EmotionThemeProvider theme={theme}>
      <RemirrorThemeContext.Provider value={value}>{children}</RemirrorThemeContext.Provider>
    </EmotionThemeProvider>
  );
};
