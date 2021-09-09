import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { FontSizeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

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

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Some text to resize</p>',
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
        <FontSizeButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
