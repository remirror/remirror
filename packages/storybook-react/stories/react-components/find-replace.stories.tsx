import 'remirror/styles/all.css';

import React from 'react';
import { wysiwygPreset } from 'remirror/extensions';
import {
  EditorComponent,
  FindReplaceComponent,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

import { mediumContent } from './sample-content/medium';

export default { title: 'Components (labs) / Find and Replace' };

const extensions = () => [...wysiwygPreset()];

export const FindReplace = () => {
  const { manager, state } = useRemirror({
    extensions,
    content: mediumContent,
    selection: 'end',
    stringHandler: 'html',
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
