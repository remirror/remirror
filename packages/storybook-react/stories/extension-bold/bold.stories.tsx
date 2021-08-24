import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { BoldExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Bold' };

const extensions = () => [new BoldExtension()];

const BoldButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button onClick={() => commands.toggleBold()} className={cx(active.bold() && 'active')}>
      Bold
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <b>bold</b></p>',
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
        <BoldButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
