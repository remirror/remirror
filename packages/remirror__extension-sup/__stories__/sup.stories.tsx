import 'remirror/styles/all.css';

import { SupExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Superscript' };

const extensions = () => [new SupExtension()];

const SupButton = () => {
  const commands = useCommands();
  return <button onClick={() => commands.toggleSuperscript()}>Toggle Superscript</button>;
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <sup>superscript</sup></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <SupButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
