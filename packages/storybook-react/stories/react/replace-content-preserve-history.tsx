import { Remirror, ThemeProvider, useRemirror, useRemirrorContext } from '@remirror/react';

const DOC = {
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

function SetContentButton() {
  const { setContent } = useRemirrorContext();
  return <button onClick={() => setContent(DOC)}>Replace content</button>;
}

const ReplaceContentPreserveHistory = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: () => [],
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

export default ReplaceContentPreserveHistory;
