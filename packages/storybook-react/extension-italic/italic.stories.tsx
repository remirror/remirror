import 'remirror/styles/all.css';
import './styles.css';

import { ItalicExtension } from 'remirror/extensions';
import { cx, htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Italic' };

const extensions = () => [new ItalicExtension()];

const ItalicButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button onClick={() => commands.toggleItalic()} className={cx(active.italic() && 'active')}>
      Italic
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <i>italic</i></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <ItalicButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
