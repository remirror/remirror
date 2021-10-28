import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { CodeExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new CodeExtension()];

const CodeButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => commands.toggleCode()}
      className={cx(active.code() && 'active')}
    >
      Code
    </button>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text as <code>code</code>.</p>',
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
        <CodeButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
