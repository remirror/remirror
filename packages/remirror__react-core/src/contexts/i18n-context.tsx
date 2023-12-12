import React, { createContext, FC, ReactNode, useCallback, useMemo } from 'react';
import type { I18nFormatter } from '@remirror/core';

const defaultI18nFormatter: I18nFormatter = (message) => message.message;

/**
 * A Provider to inject a translation formatter powered by your chosen i18n library into Remirror
 */
export const I18nContext = createContext<I18nFormatter>(defaultI18nFormatter);

export interface I18nProps {
  /**
   * Provide a function that formats ICU MessageFormat encoded messages, via your chosen i18n solution.
   *
   * You can use the `i18nFormat` function from the optional @remirror/i18n library, which is powered by Lingui
   *
   * ```ts
   * import { i18nFormat } from '@remirror/i18n';
   *
   * const Editor = () => {
   *   <Remirror i18nFormat={i18nFormat} />
   * }
   * ```
   */
  i18nFormat?: I18nFormatter;

  /**
   * The current locale for this context.
   *
   * @defaultValue 'en'
   */
  locale?: string;

  /**
   * Supported locales. Defaults to including the locale.
   *
   * @defaultValue [locale]
   */
  supportedLocales?: string[];

  children?: ReactNode;
}

export const I18nProvider: FC<I18nProps> = ({
  i18nFormat = defaultI18nFormatter,
  locale = 'en',
  supportedLocales,
  children,
}) => {
  const locales = useMemo(() => {
    return supportedLocales ?? [locale];
  }, [supportedLocales, locale]);

  const t: I18nFormatter = useCallback(
    (message, values): string => {
      return i18nFormat(message, values, locale, locales);
    },
    [i18nFormat, locale, locales],
  );

  return <I18nContext.Provider value={t}>{children}</I18nContext.Provider>;
};
