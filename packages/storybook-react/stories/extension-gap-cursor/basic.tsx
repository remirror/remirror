import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { cx, htmlToProsemirrorNode } from 'remirror';
import { GapCursorExtension, HorizontalRuleExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

interface ExampleEditorProps {
  content: string;
  hasGapCursor: boolean;
}

// Note: It's not required to add the GapCursorExtension explicitly because it's
// part of the CorePreset, i.e. every editor has it.
const extensions = () => [new HorizontalRuleExtension()];

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content: 'Move with mouse/keyboard below the horizontal rule to see the gap cursor<hr />',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      />
    </ThemeProvider>
  );
};

export default Basic;
