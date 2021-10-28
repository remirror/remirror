import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { TextColorExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new TextColorExtension()];

const TextColorButton = () => {
  const commands = useCommands();
  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextColor('red')}
      >
        Red
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextColor('green')}
      >
        Green
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.removeTextColor()}
      >
        Remove
      </button>
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<p>Text in <span data-text-color-mark="red">red</span></p>`,
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
        <TextColorButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
