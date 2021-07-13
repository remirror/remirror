import { BoldExtension, ItalicExtension, UnderlineExtension } from 'remirror/extensions';
import { ReactNativeBridgeExtension } from '@remirror/extension-react-native-bridge';
import { Remirror, useRemirror } from '@remirror/react';

export const extensions = () => [
  new BoldExtension(),
  new ItalicExtension(),
  new UnderlineExtension(),
  new ReactNativeBridgeExtension({ actions: {}, data: { cool: (state) => !!state } }),
];

/**
 * This will be consumed with the editor.
 */
const Editor = () => {
  const { manager } = useRemirror({ extensions });

  return <Remirror manager={manager} />;
};

export default Editor;
