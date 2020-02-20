import { Extension, ProsemirrorPlugin } from '@remirror/core';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { WebsocketProvider } from 'y-websocket';
import * as Y from 'yjs';

const browser = typeof window !== 'undefined';

function extension<T extends string>(name: T, plugin: ProsemirrorPlugin) {
  return class YExtension extends Extension<{}> {
    get name() {
      return name;
    }

    public plugin(): ProsemirrorPlugin {
      return plugin;
    }
  };
}

let arr: Array<ReturnType<typeof extension>> = [];

if (browser) {
  arr = [];
  const ydoc = new Y.Doc();
  const provider = new WebsocketProvider('ws://localhost:1234', 'prosemirror', ydoc);
  const type = ydoc.getXmlFragment('prosemirror');

  arr = [
    extension('ysync', ySyncPlugin(type)),
    extension(
      'ycursor',

      yCursorPlugin(provider.awareness),
    ),
    extension('yundo', yUndoPlugin()),
    extension(
      'ykeymap',
      keymap({
        'Mod-z': undo,
        'Mod-y': redo,
        'Mod-Shift-z': redo,
      }),
    ),
  ];
}

export default arr;
