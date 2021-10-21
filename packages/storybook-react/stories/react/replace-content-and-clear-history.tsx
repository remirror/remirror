import { useCallback } from 'react';
import { Remirror, ThemeProvider, useRemirror } from '@remirror/react';

const DOC = {
  type: 'doc',
  content: [
    {
      type: 'paragraph',
      content: [
        {
          type: 'text',
          text: `Undo via Ctrl+Z won't restore old content`,
        },
      ],
    },
  ],
};

const ReplaceContentAndClearHistory = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [],
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
      <Remirror manager={manager} state={state} onChange={onChange} autoRender='end'>
        <button onClick={handleClick}>Replace content</button>
      </Remirror>
    </ThemeProvider>
  );
};

export default ReplaceContentAndClearHistory;
