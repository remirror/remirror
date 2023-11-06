import 'remirror/styles/all.css';

import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { TableExtension } from '@remirror/extension-react-tables';
import { i18nFormat } from '@remirror/i18n';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { FloatingToolbar, WysiwygToolbar } from '@remirror/react-ui';

import { mediumContent } from './sample-content/medium';

export default { title: 'React UI (labs) / Toolbar' };

const extensions = () => [...wysiwygPreset(), new TableExtension()];

export const FixedToolbar = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: mediumContent,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        initialContent={state}
        autoFocus
        placeholder='Enter your text'
        i18nFormat={i18nFormat}
      >
        <WysiwygToolbar />
        <EditorComponent />
        <FloatingToolbar />
      </Remirror>
    </ThemeProvider>
  );
};
