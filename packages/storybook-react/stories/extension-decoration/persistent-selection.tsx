import 'remirror/styles/all.css';

import React from 'react';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

function Editor({ initialText }: { initialText: string }): JSX.Element {
  const { manager } = useRemirror({ builtin: { persistentSelectionClass: 'selection' } });
  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        initialContent={{
          type: 'doc',
          content: [{ type: 'paragraph', content: [{ type: 'text', text: initialText }] }],
        }}
      />
    </ThemeProvider>
  );
}

function PersistentSelection(): JSX.Element {
  return (
    <>
      <p>
        Try to select some text in one editor and then select some text in another editor, you
        will find the selection is persisted in the previous editor!
      </p>
      <Editor initialText={'Hello world'} />
      <Editor initialText={'Hello world'} />
    </>
  );
}

export default PersistentSelection;
