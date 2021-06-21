import { useState } from 'react';
import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

export default { title: 'Controlled Editor' };

const extensions = () => [new BoldExtension({}), new ItalicExtension(), new UnderlineExtension()];

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content: '<p><u>Hello</u> there <b>friend</b> and <em>partner</em>.</p>',
    stringHandler: 'html',
  });

  const [editable, setEditable] = useState(true);

  return (
    <ThemeProvider>
      <Remirror manager={manager} state={state} onChange={onChange} editable={editable} />
      <button onClick={() => setEditable(!editable)}>
        Toggle editable (currently {editable.toString()})
      </button>
    </ThemeProvider>
  );
};
