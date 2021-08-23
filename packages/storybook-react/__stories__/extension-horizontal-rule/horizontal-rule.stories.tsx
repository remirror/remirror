import 'remirror/styles/all.css';

import { HorizontalRuleExtension } from 'remirror/extensions';
import { htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / HorizontalRule' };

const extensions = () => [new HorizontalRuleExtension()];

const HorizontalRuleButton = () => {
  const commands = useCommands();
  return <button onClick={() => commands.insertHorizontalRule()}>Insert</button>;
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <hr />with horizontal rule</p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <HorizontalRuleButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
