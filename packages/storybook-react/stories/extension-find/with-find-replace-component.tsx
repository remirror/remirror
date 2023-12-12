import 'remirror/styles/all.css';

import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import { EditorComponent, Remirror, ThemeProvider, useRemirror } from '@remirror/react';
import { FindReplaceComponent } from '@remirror/react-ui';

const WithFindReplaceComponent: React.FC = () => {
  const { manager, state } = useRemirror({
    extensions: wysiwygPreset,
    content: {
      type: 'doc',
      attrs: { version: 5 },
      content: [
        {
          type: 'paragraph',
          content: [
            { type: 'text', text: 'You can also directly use the ' },
            { type: 'text', marks: [{ type: 'code' }], text: '<FindReplaceComponent/>' },
            { type: 'text', text: ' from ' },
            { type: 'text', marks: [{ type: 'code' }], text: '@remirror/react' },
          ],
        },
        { type: 'paragraph' },
      ],
    },
    selection: 'end',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus placeholder='Enter your text'>
        <FindReplaceComponent />
        <EditorComponent />
      </Remirror>
    </ThemeProvider>
  );
};

export default WithFindReplaceComponent;
