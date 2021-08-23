import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { FontSizeExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / FontSize' };

const extensions = () => [new FontSizeExtension()];

const FontSizeButtons = () => {
  const commands = useCommands();
  return (
    <>
      <button onClick={() => commands.setFontSize(8)}>Small</button>
      <button onClick={() => commands.setFontSize(24)}>Large</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Some text to resize</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <FontSizeButtons />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
