import 'remirror/styles/all.css';
import './styles.css';

import { StrikeExtension } from 'remirror/extensions';
import { cx, htmlToProsemirrorNode } from '@remirror/core';
import { ProsemirrorDevTools } from '@remirror/dev';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

export default { title: 'Extensions / Strike' };

const extensions = () => [new StrikeExtension()];

const StrikeButton = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <button onClick={() => commands.toggleStrike()} className={cx(active.strike() && 'active')}>
      Strike
    </button>
  );
};

export const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Text in <strike>strike</strike></p>',
    stringHandler: htmlToProsemirrorNode,
  });

  return (
    <ThemeProvider>
      <Remirror manager={manager} autoFocus onChange={onChange} state={state} autoRender='end'>
        <StrikeButton />
        <ProsemirrorDevTools />
      </Remirror>
    </ThemeProvider>
  );
};
