import { Extension, ProsemirrorPlugin } from '@remirror/core';
import { keymap } from 'prosemirror-keymap';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { WebsocketProvider } from 'y-websocket';
import { Doc } from 'yjs';

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

export default function makeYExtensions(provider: WebsocketProvider): Array<ReturnType<typeof extension>> {
  if (!browser) {
    return [];
  }
  const ydoc: Doc = provider.doc;
  const type = ydoc.getXmlFragment('prosemirror');

  return [
    extension('ysync', ySyncPlugin(type)),
    extension('ycursor', yCursorPlugin(provider.awareness)),
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
