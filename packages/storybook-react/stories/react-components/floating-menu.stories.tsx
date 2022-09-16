import React from 'react';
import { ColumnsExtension, wysiwygPreset } from 'remirror/extensions';
import {
  EditorComponent,
  FloatingToolbar,
  HeadingLevelButtonGroup,
  Remirror,
  ThemeProvider,
  useRemirror,
} from '@remirror/react';

import { hugeContent } from './sample-content/huge';

export default { title: 'Components (labs) / Floating Menu' };

const extensions = () => [...wysiwygPreset(), new ColumnsExtension()];

export const FloatingBlockNodeEditor = () => {
  const { manager, state } = useRemirror({
    extensions,
    selection: 'end',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <FloatingToolbar positioner='emptyBlockStart'>
          <HeadingLevelButtonGroup />
        </FloatingToolbar>
      </Remirror>
    </ThemeProvider>
  );
};

export const EditorWithLotsOfContent = () => {
  const { manager, state } = useRemirror({
    extensions,
    selection: 'end',
    content: hugeContent,
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} initialContent={state} autoFocus>
        <EditorComponent />
        <FloatingToolbar />
      </Remirror>
    </ThemeProvider>
  );
};
