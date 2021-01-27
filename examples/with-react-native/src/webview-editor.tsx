import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { Remirror, useRemirror } from '@remirror/react';

const extensions = () => [new BoldExtension(), new ItalicExtension(), new UnderlineExtension()];

/**
 * This will be consumed with the editor.
 */
const Editor = () => {
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};

export default Editor;
