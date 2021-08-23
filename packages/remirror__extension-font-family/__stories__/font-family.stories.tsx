import 'remirror/styles/all.css';

import { FontFamilyExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / FontFamily' };

const extensions = () => [new FontFamilyExtension()];

const FontFamilyButtons = () => {
  const commands = useCommands();
  return (
    <>
      <button onClick={() => commands.setFontFamily('serif')}>Serif</button>
      <button onClick={() => commands.setFontFamily('sans-serif')}>Sans serif</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content:
      '<p>Some text in <span style=" font-family:serif" data-font-family="serif">serif</span></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <FontFamilyButtons />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
