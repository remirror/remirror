import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { ColumnAttributes, ColumnsExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Columns' };

const extensions = () => [new ColumnsExtension()];

const TWO_COLUMNS: ColumnAttributes = {
  count: 2,
  fill: 'balance',
  ruleColor: 'darkred',
  ruleStyle: 'dashed',
  ruleWidth: 'thick',
  gap: '5em',
};
const THREE_COLUMNS: ColumnAttributes = {
  count: 3,
};

const ColumnsButton = () => {
  const commands = useCommands();
  return (
    <>
      <button onClick={() => commands.toggleColumns(TWO_COLUMNS)}>2 columns</button>
      <button onClick={() => commands.toggleColumns(THREE_COLUMNS)}>3 columns</button>
    </>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content:
      '<p>Remirror is a wrapper library for ProseMirror, it is an abstraction layer that makes ProseMirror easier to work with, and provides React and ProseMirror integration. ProseMirror is a toolkit for building rich text editors, it is not an out-the-box solution like Draft.JS for instance. This means ProseMirror has a steep learning curve - there are many concepts and terms to learn, and it can be difficult to structure you codebase in a logic manner. Remirror provides extensions, that abstract over various ProseMirror concepts such as schemas, commands and plugins, making it much simpler to group related logic together. Think of Remirror like Lego, you can follow the instructions to construct an out-of-the-box style editor, or as the basis of something much more bespoke, via its commands, helpers and hooks. This means we can provide both "out-of-the-box" and "bespoke" experiences, maintaining the power and flexibility that ProseMirror is known for.</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <div>
        To try out the other column config: Click again the same button to remove the current column
        config.
      </div>
      <Remirror
        manager={manager}
        autoFocus
        onChange={onChange}
        initialContent={state}
        autoRender='end'
      >
        <ColumnsButton />
      </Remirror>
    </ThemeProvider>
  );
};
