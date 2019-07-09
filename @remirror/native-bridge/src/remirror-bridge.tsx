/**
 * The bridge should respond to every change in the editor state then call post message to
 * send it back to the webview.
 *
 * It should hold an internal state representation of the editor.
 */

import { Extension, OnTransactionParams } from '@remirror/core';

/**
 * A bridge that listens to all transactions and sends the state through to a ReactNative
 * WebView.
 */
export class NativeBridgeExtension extends Extension {
  get name() {
    return 'nativeBridge' as const;
  }

  get defaultOptions() {
    return {};
  }

  /**
   * Whenever the state is updated send the new state across the webview
   */
  public onTransaction({ getState }: OnTransactionParams) {
    window.ReactNativeWebView.postMessage(JSON.stringify(getState().doc.toJSON()));
  }
}
