import { off, on, sendMessage } from 'lepont/browser';
import { ComponentType, createElement } from 'react';
import { hydrate } from 'react-dom';
import {
  AnyFunction,
  EditorState,
  extension,
  ExtensionStore,
  PlainExtension,
  Shape,
  StateJSON,
  StateUpdateLifecycleProps,
  Static,
} from '@remirror/core';

export interface ReactNativeBridgeOptions {
  /**
   * Create the data object that will be passed into the store.
   */
  data: Static<Record<string, (state: EditorState, store: ExtensionStore) => any>>;

  actions: Static<Record<string, (store: ExtensionStore) => AnyFunction<void>>>;
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
@extension<ReactNativeBridgeOptions>({
  defaultOptions: {
    actions: {},
    data: {},
  },
  staticKeys: ['actions', 'data'],
})
export class ReactNativeBridgeExtension extends PlainExtension<ReactNativeBridgeOptions> {
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
        data: this.generateData(state),
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
   *
   * TODO return an error when the command doesn't exist.
   */
  private readonly commandListener = (payload: CommandPayload) => {
    const { args, name, responseType } = payload;
    const command = this.store.commands[name];
    const message = { type: responseType, payload: { name, success: true } };

    if (!command) {
      message.payload.success = false;
    }

    command?.(...args);
    sendMessage(message);
  };

  /**
   * Dispatch the custom actions provided to the web view layer..
   */
  private readonly actionListener = (payload: CommandPayload) => {
    const { args, name, responseType } = payload;
    const action = this.options.actions[name];
    const message = { type: responseType, payload: { name, success: true } };

    if (!action) {
      message.payload.success = false;
    }

    action?.(this.store)(...args);
    sendMessage(message);
  };

  /**
   * Generate the data provided with a state update.
   */
  generateData(state: EditorState): Shape {
    const data: Shape = {};

    for (const [key, method] of Object.entries(this.options.data)) {
      data[key] = method(state, this.store);
    }

    return data;
  }
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

export interface StateUpdatePayload {
  state: StateJSON;
  data: Shape;
}

export interface CommandPayload {
  name: string;
  args: any[];
  /**
   * The unique response type for sending the success message.
   */
  responseType: string;
}

export interface CommandDonePayload {
  name: string;
  success: boolean;
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
