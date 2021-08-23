import 'remirror/styles/all.css';

import { SubExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Subscript' };

const extensions = () => [new SubExtension()];

const SubButton = () => {
  const commands = useCommands();
  return <button onClick={() => commands.toggleSubscript()}>Toggle Subscript</button>;
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <sub>subscript</sub></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <SubButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
