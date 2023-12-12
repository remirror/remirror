import React from 'react';
import { i18nFormat } from '@remirror/i18n';
import { WysiwygEditor } from '@remirror/react-editors/wysiwyg';

const INITIAL_CONTENT = `
    <p>Toolbar buttons here using translations provided by <strong>@remirror/i18n</strong>.</p>
    <p>This is an <em>optional</em> Remirror package, which uses <strong>Lingui</strong> to provide translations.</p>
`;

const Basic: React.FC = () => {
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
