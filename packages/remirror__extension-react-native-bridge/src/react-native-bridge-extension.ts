// import { createNanoEvents } from 'nanoevents';
import { AnyFunction, extension, PlainExtension, StateJSON } from '@remirror/core';

interface ExposedNativeBridgeCommands {}

export interface ReactNativeBridgeOptions {
  /**
   * The commands that will be made available to the react native
   * implementation.
   *
   * Each argument must be compatible with `JSON.stringify()` so that it can be
   * passed over the bridge.
   */
  commands: Record<string, (...args: any[]) => void>;

  helpers: Record<string, AnyFunction>;
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
@extension<ReactNativeBridgeOptions>({})
export class ReactNativeBridgeExtension extends PlainExtension<ReactNativeBridgeOptions> {
  get name() {
    return 'nativeBridge' as const;
  }
}

declare global {
  namespace Remirror {
    interface AllExtensions {
      nativeBridge: ReactNativeBridgeExtension;
    }
  }
}
