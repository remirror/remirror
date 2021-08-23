import 'remirror/styles/all.css';

import { TextCaseExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / TextCase' };

const extensions = () => [new TextCaseExtension()];

const TextCaseButton = () => {
  const commands = useCommands();
  return (
    <>
      <button onClick={() => commands.setTextCase({ casing: 'none' })}>None</button>
      <button onClick={() => commands.setTextCase({ casing: 'uppercase' })}>Upper</button>
      <button onClick={() => commands.setTextCase({ casing: 'lowercase' })}>Lower</button>
      <button onClick={() => commands.setTextCase({ casing: 'capitalize' })}>Capitalize</button>
      <button onClick={() => commands.setTextCase({ casing: 'small-caps' })}>Small caps</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<p>Some text</p>`,
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <TextCaseButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
