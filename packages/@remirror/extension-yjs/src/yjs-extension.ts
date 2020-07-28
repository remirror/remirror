import { css } from 'linaria';
import { redo, undo, yCursorPlugin, ySyncPlugin, yUndoPlugin } from 'y-prosemirror';
import { WebrtcProvider } from 'y-webrtc';
import { Doc } from 'yjs';

import {
  CommandFunction,
  convertCommand,
  extensionDecorator,
  ExtensionPriority,
  isFunction,
  nonChainable,
  OnSetOptionsParameter,
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
 * The YJS extension is the recommended extension for creating a collaborative
 * editor.
 */
@extensionDecorator<YjsOptions>({
  defaultOptions: {
    // TODO remove y-webrtc dependency and this default option.
    getProvider: () => new WebrtcProvider('global', new Doc(), {} as any),

    // TODO remove this once better abstraction is available.
    destroyProvider: (provider) => {
      const { doc } = provider;
      provider.disconnect();
      provider.destroy();
      doc.destroy();
    },
  },
  defaultPriority: ExtensionPriority.High,
  staticKeys: ['destroyProvider'],
})
export class YjsExtension extends PlainExtension<YjsOptions> {
  get name() {
    return 'yjs' as const;
  }

  #provider?: YjsRealtimeProvider;

  /**
   * The provider that is being used for the editor.
   */
  get provider(): YjsRealtimeProvider {
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
  createExternalPlugins() {
    const yDoc = this.provider.doc;
    const type = yDoc.getXmlFragment('prosemirror');
    return [ySyncPlugin(type), yCursorPlugin(this.provider.awareness), yUndoPlugin()];
  }

  createCommands() {
    return {
      /**
       * Undo within a collaborative editor.
       */
      yUndo: (): CommandFunction => nonChainable(convertCommand(undo)),

      /**
       * Redo, within a collaborative editor.
       */
      yRedo: (): CommandFunction => nonChainable(convertCommand(redo)),
    };
  }

  /**
   * This managers the updates of the collaboration provider.
   */
  onSetOptions(parameter: OnSetOptionsParameter<YjsOptions>) {
    const { changes } = parameter;

    // TODO move this into a new method in `plugins-extension`.
    if (changes.getProvider.changed) {
      const previousPlugins = this.externalPlugins;
      const newPlugins = (this.externalPlugins = this.createExternalPlugins());

      this.store.addOrReplacePlugins(newPlugins, previousPlugins);
      this.store.reconfigureStatePlugins();
    }
  }

  /**
   * Remove the provider from the manager.
   */
  onDestroy() {
    if (!this.#provider) {
      return;
    }

    this.options.destroyProvider(this.#provider);
  }
}

/**
 * @remarks
 * This magic property is transformed by babel via linaria into CSS that will be
 * wrapped by the `.remirror-editor` class; when you edit it you must run `yarn
 * fix:css` to regenerate `@remirror/styles/all.css`.
 */
export const editorStyles = css`
  .ProseMirror {
    .ProseMirror-yjs-cursor {
      position: absolute;
      border-left: black;
      border-left-style: solid;
      border-left-width: 2px;
      border-color: orange;
      height: 1em;
      word-break: normal;
      pointer-events: none;

      > div {
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
    }

    > .ProseMirror-yjs-cursor:first-child {
      margin-top: 16px;
    }

    p:first-child,
    h1:first-child,
    h2:first-child,
    h3:first-child,
    h4:first-child,
    h5:first-child,
    h6:first-child {
      margin-top: 16px;
    }
  }

  #y-functions {
    position: absolute;
    top: 20px;
    right: 20px;

    > * {
      display: inline-block;
    }
  }
`;
