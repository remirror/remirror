import 'remirror/styles/all.css';

import { HeadingExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Heading' };

const extensions = () => [new HeadingExtension()];

const HeadingButtons = () => {
  const commands = useCommands();
  return (
    <>
      <button onClick={() => commands.toggleHeading({ level: 1 })}>H1</button>
      <button onClick={() => commands.toggleHeading({ level: 2 })}>H2</button>
      <button onClick={() => commands.toggleHeading({ level: 3 })}>H3</button>
      <button onClick={() => commands.toggleHeading({ level: 4 })}>H4</button>
      <button onClick={() => commands.toggleHeading({ level: 5 })}>H5</button>
      <button onClick={() => commands.toggleHeading({ level: 6 })}>H6</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>`,
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <HeadingButtons />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
