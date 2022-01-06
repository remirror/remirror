import 'remirror/styles/all.css';

import { htmlToProsemirrorNode } from 'remirror';
import { FontSizeExtension } from 'remirror/extensions';
import {
  Remirror,
  ThemeProvider,
  useCommands,
  useHelpers,
  useRemirror,
  useRemirrorContext,
} from '@remirror/react';

const extensions = () => [new FontSizeExtension()];

const FontSizeButtons = () => {
  const commands = useCommands();
  const helpers = useHelpers();
  const { view } = useRemirrorContext({ autoUpdate: true });

  return (
    <>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setFontSize(8)}
      >
        Small
      </button>
      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.setFontSize(24)}
      >
        Large
      </button>

      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.decreaseFontSize()}
      >
        -
      </button>

      <button onMouseDown={(event) => event.preventDefault()}>
        current fontSize: {helpers.getFontSizeForSelection(view.state.selection)}
      </button>

      <button
        onMouseDown={(event) => event.preventDefault()}
        onClick={() => commands.increaseFontSize()}
      >
        +
      </button>
    </>
  );
};

const Basic = (): JSX.Element => {
  const { manager, state, onChange } = useRemirror({
    extensions: extensions,
    content: '<p>Some text to resize</p>',
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
        <FontSizeButtons />
      </Remirror>
    </ThemeProvider>
  );
};

export default Basic;
