import {
  CustomHandlerKeyList,
  DefaultExtensionOptions,
  HandlerKeyList,
  PlainExtension,
  StaticKeyList,
  convertCommand,
} from '@remirror/core';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { Doc } from 'yjs';
import { WebrtcProvider } from 'y-webrtc';
import { Observable } from 'lib0/observable';

/**
 * yjs typings are very rough; so we define here the interface that we require
 * (y-webrtc and y-websocket providers are both compatible with this interface;
 * no other providers have been checked).
 */
interface YjsRealtimeProvider extends Observable<string> {
  doc: Doc;
  awareness: any;
}

export interface YjsOptions {
  provider: YjsRealtimeProvider; // TODO
}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class YjsExtension extends PlainExtension<YjsOptions> {
  static readonly staticKeys: StaticKeyList<YjsOptions> = [];
  static readonly handlerKeys: HandlerKeyList<YjsOptions> = [];
  static readonly customHandlerKeys: CustomHandlerKeyList<YjsOptions> = [];

  static readonly defaultOptions: DefaultExtensionOptions<YjsOptions> = {
    // DEFINITELY OVERRIDE THIS!
    provider: new WebrtcProvider('global', new Doc(), {}),
  };

  get name() {
    return 'yjs' as const;
  }

  createKeymap = () => {
    return {
      'Mod-z': convertCommand(undo),
      'Mod-y': convertCommand(redo),
      'Mod-Shift-z': convertCommand(redo),
    };
  };

  createExternalPlugins = () => {
    const { provider } = this.options;
    const ydoc: Doc = provider.doc;
    const type = ydoc.getXmlFragment('prosemirror');
    return [ySyncPlugin(type), yCursorPlugin(provider.awareness), yUndoPlugin()];
  };
}
