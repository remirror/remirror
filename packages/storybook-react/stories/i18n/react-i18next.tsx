import i18n from 'i18next';
import ICU from 'i18next-icu';
import React, { useCallback } from 'react';
import { initReactI18next, useTranslation } from 'react-i18next';
import type { I18nFormatter } from 'remirror';
import allMessages from '@remirror/messages/en/all-messages.json';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

i18n
  .use(ICU) // Required if using the provided messages from @remirror/messages
  .use(initReactI18next)
  .init({
    resources: {
      en: {
        translation: allMessages,
      },
    },
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });

const INITIAL_CONTENT = `
    <p>Toolbar buttons here using translations provided by <strong>react-i18next</strong>.</p>
    <p>The <code>i18next-icu</code> module must also be used.</p>
`;

const Basic: React.FC = () => {
  const { t } = useTranslation();

  const i18nFormat: I18nFormatter = useCallback(
    ({ id }, values) => {
      return t(id, values);
    },
    [t],
  );

  return (
    <WysiwygEditor
      placeholder='Start typing...'
      initialContent={INITIAL_CONTENT}
      i18nFormat={i18nFormat}
      stringHandler='html'
    />
  );
};

export default Basic;
