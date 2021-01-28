import { useBridge } from 'lepont';
import { ComponentType, useCallback, useState } from 'react';
import { View } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
import { StateJSON } from '@remirror/core';

export interface WebviewEditorProps {
  /**
   * The JSON state.
   */
  state: StateJSON;
}

export interface NativeRemirrorProps {
  /**
   * The bundled editor which will be placed within the.
   *
   * ```ts
   * import { bundleWithRollup } from 'bundler.macro';
   *
   * const bundle = bundWithRollup('./path/to/editor.tsx', 'EditorName');
   * ```
   */
  bundle: string;

  /**
   * The name given to the bundle when generated with `bundleWithRollup`.
   */
  name: string;

  /**
   * The editor component that was bundled into a string. It takes no props and
   * is used to create an SSR render of the component to prevent the flash of
   * unstyled content in the webview that is rendered.
   */
  WebviewEditor: ComponentType<WebviewEditorProps>;
}

/**
 * The react native remirror component which also acts as a provider.
 */
export const NativeRemirror = (props: NativeRemirrorProps): JSX.Element => {
  // const [ref, onMessage] = useBridge((registry) => {
  //   registry.;
  // });

  return <View />;
};

/**
 * The context value which are passed from the webview component to the native
 * view layer on every state update.
 */
export interface NativeRemirrorContext {
  /**
   * The status of each mark and whether it is active.
   */
  activeMarks: Record<string, boolean>;

  /**
   * The active status of each node.
   */
  activeNodes: Record<string, boolean>;

  /**
   * Some commands have a custom active property, and this is able to determine that value.
   */
  activeCommands: Record<string, boolean>;

  /**
   * The commands that can
   */
  enabledCommands: Record<string, boolean>;
}
