import { i18n } from '@lingui/core';

import enLocale from './en';
import { en } from './plurals';

i18n.loadLocaleData('en', { plurals: en });

i18n.load({
  en: enLocale.messages,
});

export type {
  I18n,
  AllLocaleData,
  AllMessages,
  Locale,
  LocaleData,
  Locales,
  MessageDescriptor,
  Messages,
} from '@lingui/core';
export { setupI18n, formats } from '@lingui/core';
export { i18n };
