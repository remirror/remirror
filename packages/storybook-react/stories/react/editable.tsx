import { useState } from 'react';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const Editable = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [],
    content: '<p>Some text</p>',
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

export default Editable;
