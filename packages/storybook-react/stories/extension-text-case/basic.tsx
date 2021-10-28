import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { TextCaseExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new TextCaseExtension()];

const TextCaseButton = () => {
  const commands = useCommands();
  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextCase({ casing: 'none' })}
      >
        None
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextCase({ casing: 'uppercase' })}
      >
        Upper
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextCase({ casing: 'lowercase' })}
      >
        Lower
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextCase({ casing: 'capitalize' })}
      >
        Capitalize
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setTextCase({ casing: 'small-caps' })}
      >
        Small caps
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
        <TextCaseButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
