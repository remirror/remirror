import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { HardBreakExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new HardBreakExtension()];

const HardBreakButton = () => {
  const commands = useCommands();
  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => commands.insertHardBreak()}
    >
      Insert
    </button>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text with <br />hard break</p>',
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
        <HardBreakButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
