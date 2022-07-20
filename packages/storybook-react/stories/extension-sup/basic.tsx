import 'remirror/styles/all.css';

import React from 'react';
import { htmlToProsemirrorNode } from 'remirror';
import { SupExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new SupExtension()];

const SupButton = () => {
  const commands = useCommands();
  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => commands.toggleSuperscript()}
    >
      Toggle Superscript
    </button>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <sup>superscript</sup></p>',
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
      >
        <SupButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
