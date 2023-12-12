import React, { useCallback } from 'react';
import { IntlProvider, useIntl } from 'react-intl';
import type { I18nFormatter } from 'remirror';
import allMessages from '@remirror/messages/en/all-messages.json';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const INITIAL_CONTENT = `
    <p>Toolbar buttons here using translations provided by <strong>Format.JS</strong> via <code>react-intl</code>.</p>
`;

const Editor: React.FC = () => {
  const intl = useIntl();

  const i18nFormat: I18nFormatter = useCallback(
    ({ id, message, comment }, values) => {
      return intl.formatMessage({ id, defaultMessage: message, description: comment }, values);
    },
    [intl],
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

const Basic: React.FC = () => {
  return (
    <IntlProvider locale='en' messages={allMessages}>
      <Editor />
    </IntlProvider>
  );
};

export default Basic;
