/**
 * @module
 *
 * The `ThemeProvider` to wrap your editor with when using these components.
 */

import { cx } from '@linaria/core';
import type { ElementType, ReactElement, ReactNode } from 'react';
import { createContext, useContext, useEffect, useMemo } from 'react';
import { Provider as ReakitProvider } from 'reakit';

import { deepMerge } from '@remirror/core';
import { I18n, i18n } from '@remirror/i18n';
import type { RemirrorThemeType } from '@remirror/theme';
import { createThemeVariables, CSSProperties, Theme } from '@remirror/theme';

import * as system from './system';

const defaultI18nContext = { i18n, locale: 'en' };

/**
 * Create the context for the i18n framework used within remirror.
 */
export const I18nContext = createContext<I18nContextProps>(defaultI18nContext);

export interface I18nContextProps {
  /**
   * Provide your own i18n with all the locales you need for your app.
   *
   * ```ts
   * import { i18n } from '@remirror/i18n';
   * import esLocale from '@remirror/i18n/es';
   * import { SocialEditor } from '@remirror/react-social-editor';
   * import { es } from 'make-plural/plurals';
   *
   * i18n.loadLocaleData('es', { plurals: es });
   *
   * i18n.load({
   *   es: esLocale.messages,
   * });
   *
   * const Editor = () => {
   *   <SocialEditor i18n={i18n} />
   * }
   * ```
   */
  i18n: I18n;

  /**
   * The current locale for this context.
   *
   * @default 'en'
   */
  locale: string;

  /**
   * Supported locales. Defaults to including the locale.
   *
   * @default [locale]
   */
  supportedLocales?: string[];
}

export interface I18nProviderProps extends Partial<I18nContextProps> {
  children: ReactNode;
}

/**
 * A provider component for the remirror i18n helper library.
 *
 * This uses `@lingui/core` in the background. So please star and support the
 * project when you have a moment.
 */
export const I18nProvider = (props: I18nProviderProps): ReactElement<I18nProviderProps> => {
  const { i18n, locale = 'en', supportedLocales, children } = { ...defaultI18nContext, ...props };

  useEffect(() => {
    i18n.activate(locale, supportedLocales ?? [locale]);
  }, [i18n, locale, supportedLocales]);

  return (
    <I18nContext.Provider value={{ i18n, locale, supportedLocales }}>
      {children}
    </I18nContext.Provider>
  );
};

const ThemeContext = createContext<RemirrorThemeType>({});

export interface UseThemeProps {
  /**
   * The theme to customise the look and feel of your remirror editor.
   */
  theme?: RemirrorThemeType;
  /**
   * Any extra class names to add to the wrapper component.
   */
  className?: string;
}

/**
 * Get the theme from the context and convert it to a style object which can be
 * attached to any element.
 *
 * The theme provided is deeply merged with the parent theme.
 */
export function useTheme(
  props: UseThemeProps = {},
): {
  theme: RemirrorThemeType;
  style: CSSProperties;
  className?: string;
} {
  // Get theme from parent context.
  const parent = useContext(ThemeContext);
  const theme = useMemo(() => deepMerge(parent, props.theme ?? {}), [parent, props.theme]);
  const style = useMemo(() => createThemeVariables(theme).styles, [theme]);

  const className = cx(Theme.THEME, props.className);

  return useMemo(() => ({ style, className, theme }), [style, className, theme]);
}

export interface ThemeProviderProps extends UseThemeProps {
  /**
   * A custom component to use for the wrapper.
   *
   * @default 'div'
   */
  as?: ElementType<{ style?: CSSProperties; className?: string }>;

  children: ReactNode;
}

/**
 * This the `ThemeProvider`. Wrap your editor with it to customise the theming
 * of content within your editor.
 *
 * Please be aware that this wraps your component in an extra dom layer.
 */
export const ThemeProvider = (props: ThemeProviderProps): ReactElement<ThemeProviderProps> => {
  const { children, as: Component = 'div' } = props;
  const { theme, style, className } = useTheme({ theme: props.theme });

  return (
    <ReakitProvider unstable_system={system}>
      <ThemeContext.Provider value={theme}>
        <Component style={style} className={className}>
          {children}
        </Component>
      </ThemeContext.Provider>
    </ReakitProvider>
  );
};
