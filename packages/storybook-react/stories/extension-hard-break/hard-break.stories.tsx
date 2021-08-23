import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { HardBreakExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / HardBreak' };

const extensions = () => [new HardBreakExtension()];

const HardBreakButton = () => {
  const commands = useCommands();
  return <button onClick={() => commands.insertHardBreak()}>Insert</button>;
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text with <br />hard break</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <HardBreakButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
