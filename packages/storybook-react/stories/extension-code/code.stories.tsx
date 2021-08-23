import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { CodeExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Code' };

const extensions = () => [new CodeExtension()];

const CodeButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button onClick={() => commands.toggleCode()} className={cx(active.code() && 'active')}>
      Code
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text as <code>code</code></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <CodeButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
