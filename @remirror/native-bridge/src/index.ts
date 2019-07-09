export * from './remirror-bridge';

declare global {
  interface Window {
    ReactNativeWebView: {
      /**
       * Post messages from webView to React Native
       */
      postMessage(message: string): void;
    };

    RemirrorNativeBridge: {
      dispatch(type: string, data: Record<string, unknown>): void;
    };
  }
}
