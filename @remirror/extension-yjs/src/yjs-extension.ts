import { css } from 'linaria';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import {
  convertCommand,
  DefaultExtensionOptions,
  ExtensionPriority,
  isFunction,
  PlainExtension,
  Static,
} from '@remirror/core';

/**
 * yjs typings are very rough; so we define here the interface that we require
 * (y-webrtc and y-websocket providers are both compatible with this interface;
 * no other providers have been checked).
 */
interface YjsRealtimeProvider {
  doc: Doc;
  awareness: any;
  destroy: () => void;
  disconnect: () => void;
}

export interface YjsOptions<Provider extends YjsRealtimeProvider = YjsRealtimeProvider> {
  /**
   * Get the provider for this extension. There is an option to pass in a
   * function for when setting this up in a non dom environment.
   */
  getProvider: Provider | (() => Provider);

  /**
   * Remove the active provider. This should only be set at initial construction
   * of the editor.
   */
  destroyProvider: Static<(provider: Provider) => void>;
}

/**
 * An extension for the remirror editor. CHANGE ME.
 */
export class YjsExtension<
  Provider extends YjsRealtimeProvider = YjsRealtimeProvider
> extends PlainExtension<YjsOptions<Provider>> {
  static readonly defaultPriority = ExtensionPriority.High;
  static readonly defaultOptions: DefaultExtensionOptions<YjsOptions> = {
    // TODO remove y-webrtc dependency and this default option.
    getProvider: () => new WebrtcProvider('global', new Doc(), {}),

    // TODO remove this once better abstraction is available.
    destroyProvider: (provider) => {
      const { doc } = provider;
      provider.disconnect();
      provider.destroy();
      doc.destroy();
    },
  };

  get name() {
    return 'yjs' as const;
  }

  #provider?: Provider;

  /**
   * The provider that is being used for the editor.
   */
  get provider(): Provider {
    const { getProvider } = this.options;

    if (!this.#provider) {
      this.#provider = isFunction(getProvider) ? getProvider() : getProvider;
    }

    return this.#provider;
  }

  /**
   * Create the custom undo keymaps for the
   */
  createKeymap = () => {
    return {
      'Mod-z': convertCommand(undo),
      'Mod-y': convertCommand(redo),
      'Mod-Shift-z': convertCommand(redo),
    };
  };

  /**
   * Create the yjs plugins.
   */
  createExternalPlugins = () => {
    const yDoc = this.provider.doc;
    const type = yDoc.getXmlFragment('prosemirror');
    return [ySyncPlugin(type), yCursorPlugin(this.provider.awareness), yUndoPlugin()];
  };

  /**
   * Remove the provider from the manager.
   */
  onDestroy = () => {
    if (!this.#provider) {
      return;
    }

    this.options.destroyProvider(this.#provider);
  };
}

/**
 * @remarks
 * This magic property is transformed by babel via linaria into CSS that will
 * be wrapped by the `.remirror-editor` class; when you edit it you must run
 * `yarn fix:css` to regenerate `@remirror/styles/all.css`.
 */
export const editorStyles = css`
  placeholder {
    display: inline;
    border: 1px solid #ccc;
    color: #ccc;
  }
  placeholder:after {
    content: '☁';
    font-size: 200%;
    line-height: 0.1;
    font-weight: bold;
  }
  .ProseMirror img {
    max-width: 100px;
  }
  /* this is a rough fix for the first cursor position when the first paragraph is empty */
  .ProseMirror > .ProseMirror-yjs-cursor:first-child {
    margin-top: 16px;
  }
  .ProseMirror p:first-child,
  .ProseMirror h1:first-child,
  .ProseMirror h2:first-child,
  .ProseMirror h3:first-child,
  .ProseMirror h4:first-child,
  .ProseMirror h5:first-child,
  .ProseMirror h6:first-child {
    margin-top: 16px;
  }
  .ProseMirror-yjs-cursor {
    position: absolute;
    border-left: black;
    border-left-style: solid;
    border-left-width: 2px;
    border-color: orange;
    height: 1em;
    word-break: normal;
    pointer-events: none;
  }
  .ProseMirror-yjs-cursor > div {
    position: relative;
    top: -1.05em;
    font-size: 13px;
    background-color: rgb(250, 129, 0);
    font-family: serif;
    font-style: normal;
    font-weight: normal;
    line-height: normal;
    user-select: none;
    color: white;
    padding-left: 2px;
    padding-right: 2px;
  }
  #y-functions {
    position: absolute;
    top: 20px;
    right: 20px;
  }
  #y-functions > * {
    display: inline-block;
  }
`;
