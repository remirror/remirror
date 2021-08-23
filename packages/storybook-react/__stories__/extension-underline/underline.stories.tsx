import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { UnderlineExtension } from 'remirror/extensions';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Underline' };

const extensions = () => [new UnderlineExtension()];

const UnderlineButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button
      onClick={() => commands.toggleUnderline()}
      className={cx(active.underline() && 'active')}
    >
      Underline
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <u>underline</u></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <UnderlineButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
