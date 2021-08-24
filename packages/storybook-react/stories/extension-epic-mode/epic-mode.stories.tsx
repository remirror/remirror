import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { EpicModeExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Extensions / EpicMode' };

const extensions = () => [new EpicModeExtension()];

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Some text</p>',
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
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
