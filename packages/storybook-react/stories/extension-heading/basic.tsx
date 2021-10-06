import 'remirror/styles/all.css';
import './styles.css';

import { cx, htmlToProsemirrorNode } from 'remirror';
import { HeadingExtension } from 'remirror/extensions';
import { Remirror, ThemeProvider, useActive, useCommands, useRemirror } from '@remirror/react';

const extensions = () => [new HeadingExtension()];

const HeadingButtons = () => {
  const commands = useCommands();
  const active = useActive(true);
  return (
    <>
      {[1, 2, 3, 4, 5, 6].map((level) => (
        <button
          key={level}
          onClick={() => commands.toggleHeading({ level })}
          className={cx(active.heading({ level }) && 'active')}
        >
          H{level}
        </button>
      ))}
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: `<h1>Heading 1</h1><h2>Heading 2</h2><h3>Heading 3</h3>`,
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
        <HeadingButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
