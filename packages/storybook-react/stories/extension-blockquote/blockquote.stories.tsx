import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { BlockquoteExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Blockquote' };

const extensions = () => [new BlockquoteExtension()];

const BlockquoteButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button
      onClick={() => commands.toggleBlockquote()}
      className={cx(active.blockquote() && 'active')}
    >
      Blockquote
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<blockquote><p>I'm a blockquote</p></blockquote>`,
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
        <BlockquoteButton />
      </Remirror>
    </ThemeProvider>
  );
};
