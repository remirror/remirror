import 'remirror/styles/all.css';
import './styles.css';

import React from 'react';
import { cx, htmlToProsemirrorNode } from 'remirror';
import { ItalicExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new ItalicExtension()];

const ItalicButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button
      onMouseDown={(event) => event.preventDefault()}
      onClick={() => commands.toggleItalic()}
      className={cx(active.italic() && 'active')}
    >
      Italic
    </button>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <i>italic</i></p>',
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
        <ItalicButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
