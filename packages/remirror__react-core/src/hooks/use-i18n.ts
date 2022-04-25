import { ContextHook as _, createContextState } from 'create-context-state';
import { I18n, i18n as defaultI18n } from '@remirror/i18n';

/**
 * A Provider and hooks component for the remirror i18n helper library.
 *
 * This uses `@lingui/core` in the background. So please star and support the
 * project when you have a moment.
 */
export const [I18nProvider, useI18n] = createContextState<UseI18nReturn, I18nProps>(({ props }) => {
  const locale = props.locale ?? 'en';
  const i18n = props.i18n ?? defaultI18n;
  const supportedLocales = props.supportedLocales ?? [locale];
  const t: I18n['_'] = (...args) => i18n._(...args);

  return { locale, i18n, supportedLocales, t };
});

export interface UseI18nReturn extends Required<I18nProps> {
  /**
   * A translation utility for translating a predefined string.
   */
  t: I18n['_'];
}
export interface I18nProps {
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
  i18n?: I18n;

  /**
   * The current locale for this context.
   *
   * @default 'en'
   */
  locale?: string;

  /**
   * Supported locales. Defaults to including the locale.
   *
   * @default [locale]
   */
  supportedLocales?: string[];
}
