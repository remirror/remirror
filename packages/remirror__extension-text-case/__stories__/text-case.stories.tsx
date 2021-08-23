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
      <button onClick={() => commands.setTextCase({ casing: 'upper' })}>Upper</button>
      <button onClick={() => commands.setTextCase({ casing: 'lower' })}>Lower</button>
      <button onClick={() => commands.setTextCase({ casing: 'capitalize' })}>Capitalize</button>
      <button onClick={() => commands.setTextCase({ casing: 'smallCaps' })}>SmallCaps</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<p>Text in <span data-text-case-mark="red">red</span></p>`,
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
