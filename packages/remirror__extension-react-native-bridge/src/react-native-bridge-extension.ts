import { off, on, sendMessage } from 'lepont/browser';
import { ComponentType, createElement } from 'react';
import { hydrate } from 'react-dom';
import {
  AnyFunction,
  EditorState,
  extension,
  ExtensionStore,
  PlainExtension,
  StateJSON,
  StateUpdateLifecycleProps,
  Static,
} from '@remirror/core';

export interface DefaultBridgeData {
  [key: string]: unknown;
}
export interface DefaultBridgeActions {
  [key: string]: AnyFunction<void>;
}

export interface ReactNativeBridgeOptions<
  Data extends DefaultBridgeData,
  Actions extends DefaultBridgeActions
> {
  /**
   * Create the data object that will be passed into the store.
   */
  createData: Static<(state: EditorState, store: ExtensionStore) => Data>;

  createActions: Static<(store: ExtensionStore) => Actions>;
}

export interface ReactNativeBridgeEvents {
  /**
   * Receive the full state update when a new state is received.
   */
  stateUpdate: (json: StateJSON) => void;
}

/**
 * Add support for communication between the react native webview and the
 * remirror editor.
 */
@extension<ReactNativeBridgeOptions<DefaultBridgeData, DefaultBridgeActions>>({
  defaultOptions: {
    createActions: () => ({}),
    createData: () => ({}),
  },
  staticKeys: ['createActions', 'createData'],
})
export class ReactNativeBridgeExtension<
  Data extends DefaultBridgeData = DefaultBridgeData,
  Actions extends DefaultBridgeActions = DefaultBridgeActions
> extends PlainExtension<ReactNativeBridgeOptions<Data, Actions>> {
  get name() {
    return 'reactNativeBridge' as const;
  }

  /**
   * Create the bridged event listener.
   */
  onCreate(): void {
    on(ReactNativeBridgeEvent.Command, this.commandListener);
    on(ReactNativeBridgeEvent.Action, this.actionListener);
  }

  /**
   * Send the state update.
   */
  onStateUpdate({ state }: StateUpdateLifecycleProps): void {
    const { helpers } = this.store;
    sendMessage({
      type: ReactNativeBridgeEvent.StateUpdate,
      payload: {
        state: helpers.getStateJSON(state),
        data: this.options.createData(state, this.store),
      },
    });
  }

  /**
   * Stop listening to the commands coming from the react native application.
   */
  onDestroy(): void {
    off(ReactNativeBridgeEvent.Command, this.commandListener);
    off(ReactNativeBridgeEvent.Action, this.actionListener);
  }

  /**
   * Dispatch commands issued from the react native app.
   */
  private readonly commandListener = (command: string, ...args: any[]) => {
    this.store.commands[command]?.(...args);
  };

  /**
   * Dispatch the custom actions provided to the web view layer..
   */
  private readonly actionListener = (action: string, ...args: any[]) => {
    this.options.createActions(this.store)[action]?.(...args);
  };
}

export const ReactNativeBridgeEvent = {
  /**
   * WebView => Native.
   *
   * Called whenever the editor state is update.
   */
  StateUpdate: 'stateUpdate',

  /**
   * Native => WebView.
   *
   * Trigger a command.
   */
  Command: 'command',

  /**
   * Native => WebView.
   *
   * A custom action.
   */
  Action: 'action',
} as const;

export interface WebViewEditorProps {
  /**
   * The JSON state.
   */
  state: StateJSON;
}

export interface StateUpdatePayload<Data extends DefaultBridgeData = DefaultBridgeData> {
  state: StateJSON;
  data: Data;
}

export type WebViewEditorType = ComponentType<WebViewEditorProps>;

/**
 * The global method responsible for rendering the WebView component
 */
function renderWebViewComponent(WebViewEditor: WebViewEditorType, state: StateJSON) {
  hydrate(
    createElement(WebViewEditor, { state }),
    document.querySelector(`#${REMIRROR_NATIVE_ID}`),
  );
}

/**
 * @internal
 */
export const REMIRROR_NATIVE_ID = '_remirror-webview';

/**
 * @internal
 */
export const HYDRATE_COMPONENT_NAME = '_remirror_hydrate';

if (typeof window !== undefined) {
  Object.assign(window, { HYDRATE_COMPONENT_NAME: renderWebViewComponent });
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      reactNativeBridge: ReactNativeBridgeExtension;
    }
  }
}
