import { useCallback, useState } from 'react';
import { RemirrorJSON } from '@remirror/core';
import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

const DOC: RemirrorJSON = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: 'New content',
        },
      ],
    },
  ],
};

export default { title: 'Controlled Editor' };

const extensions = () => [];

export const Editable = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
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

function SetContentButton() {
  const { setContent } = useRemirrorContext();
  return <button onClick={() => setContent(DOC)}>Replace content</button>;
}

export const ReplaceContentPreserveHistory = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content: '<p>Original content</p>',
    stringHandler: 'html',
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} state={state} onChange={onChange} autoRender='end'>
        <SetContentButton />
      </Remirror>
    </ThemeProvider>
  );
};

export const ReplaceContentAndClearHistory = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions,
    content: '<p>Original content</p>',
    stringHandler: 'html',
  });

  const handleClick = useCallback(() => {
    // Clear out old state when setting data from outside
    // This prevents e.g. the user from using CTRL-Z to go back to the old state
    manager.view.updateState(manager.createState({ content: DOC }));
  }, [manager]);

  return (
    <ThemeProvider>
      <Remirror manager={manager} state={state} onChange={onChange} />
      <button onClick={handleClick}>Replace content</button>
    </ThemeProvider>
  );
};
