import { createIntl, createIntlCache } from '@formatjs/intl';
import React, { useCallback } from 'react';
import type { I18nFormatter } from 'remirror';
import allMessages from '@remirror/messages/en/all-messages.json';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const INITIAL_CONTENT = `
    <p>Toolbar buttons here using translations provided by <strong>Format.JS</strong> in the <em>imperative</em> style.</p>
`;

const cache = createIntlCache();
const intl = createIntl(
  {
    locale: 'en',
    messages: allMessages,
  },
  cache,
);

const Imperative: React.FC = () => {
  const i18nFormat: I18nFormatter = useCallback(({ id, message, comment }, values) => {
    return intl.formatMessage({ id, defaultMessage: message, description: comment }, values);
  }, []);

  return (
    <WysiwygEditor
      placeholder='Start typing...'
      initialContent={INITIAL_CONTENT}
      i18nFormat={i18nFormat}
      stringHandler='html'
    />
  );
};

export default Imperative;
