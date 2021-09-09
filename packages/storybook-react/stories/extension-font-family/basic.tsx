import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { FontFamilyExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

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

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content:
      '<p>Some text in <span style=" font-family:serif" data-font-family="serif">serif</span></p>',
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
        <FontFamilyButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
