import 'remirror/styles/all.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { TextColorExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new TextColorExtension()];

const TextColorButton = () => {
  const commands = useCommands();
  const active = useActive();
  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextColor('red')}
        className={cx(active.textColor({ color: 'red' }) && 'active')}
      >
        Red
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextColor('green')}
        className={cx(active.textColor({ color: 'green' }) && 'active')}
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
