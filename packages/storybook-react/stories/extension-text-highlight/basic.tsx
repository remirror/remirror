import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { TextHighlightExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new TextHighlightExtension()];

const HighlightButtons = () => {
  const commands = useCommands();
  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextHighlight('red')}
      >
        Highlight red
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextHighlight('green')}
      >
        Highlight green
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.removeTextHighlight()}
      >
        Remove
      </button>
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<p>Some text</p>`,
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
        <HighlightButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
