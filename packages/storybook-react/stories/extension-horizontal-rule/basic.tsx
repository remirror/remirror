import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { HorizontalRuleExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new HorizontalRuleExtension()];

const HorizontalRuleButton = () => {
  const commands = useCommands();
  return <button onClick={() => commands.insertHorizontalRule()}>Insert</button>;
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <hr />with horizontal rule</p>',
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
        <HorizontalRuleButton />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
