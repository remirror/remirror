import { createContextHook, createContextState } from 'create-context-state';
import { BridgeOption, Registry, useBridge } from 'lepont';
import minDocument from 'min-document';
import { ComponentType, useCallback, useMemo, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import { View } from 'react-native';
import WebView, { WebViewProps } from 'react-native-webview';
import { Except } from 'type-fest';
import {
  AnyExtension,
  CommandsFromExtensions,
  GetSchema,
  RemirrorManager,
  StateJSON,
} from '@remirror/core';
import {
  DefaultBridgeActions,
  DefaultBridgeData,
  HYDRATE_COMPONENT_NAME,
  ReactNativeBridgeEvent,
  REMIRROR_NATIVE_ID,
  StateUpdatePayload,
  WebViewEditorType,
} from '@remirror/extension-react-native-bridge';
import { EditorState } from '@remirror/pm/state';
import {
  I18nProps,
  I18nProvider,
  ReactExtensions,
  useRemirror,
  UseRemirrorProps,
} from '@remirror/react-core';

/**
 * Props which are passed into the `useRemirror` hook.
 */
export interface UseNativeRemirrorProps<Extension extends AnyExtension>
  extends BaseNativeRemirrorProps,
    Except<UseRemirrorProps<Extension>, 'extensions' | 'document' | 'forceEnvironment'> {
  /**
   * Provide a function that returns an array of extensions which will be used
   * to create the manager.
   */
  extensions?: () => Extension[];
}

export interface UseNativeRemirrorReturn<Extension extends AnyExtension> {
  /**
   * The manager which is required by the `<Remirror />` component.
   */
  manager: RemirrorManager<Extension>;

  /**
   * The initial editor state based on the provided `content` and `selection`
   * properties. If none were passed in then the state is created from the
   * default empty doc node as defined by the editor Schema.
   */
  state: EditorState<GetSchema<Extension>>;

  /**
   * A function to update the state when you intend to make the editor
   * controlled.
   *
   * ```ts
   * import React, { useCallback } from 'react';
   * import { useRemirror, Provider } from '@remirror/react';
   * import { htmlToProsemirrorNode } from 'remirror';
   *
   * const Editor = () => {
   *   const { manager, setState, state } = useRemirror({
   *     content: '<p>Some content</p>',
   *     stringHandler: htmlToProsemirrorNode
   *   });
   *
   *   return (
   *     <Remirror
   *       onChange={useCallback((changeProps) => setState(changeProps.state), [setState])}
   *       state={state}
   *       manager={manager}
   *     />
   *   );
   * }
   * ```
   */
  setState: (state: EditorState<GetSchema<Extension>>) => void;

  /**
   * The HTML webview content.
   */
  html: string;
}

export function useNativeRemirror<Extension extends AnyExtension>(
  props: UseNativeRemirrorProps<Extension>,
): UseNativeRemirrorReturn<ReactExtensions<Extension>> {
  const { WebViewEditor, bundle, name, ...remirrorProps } = props;
  const { manager, setState, state } = useRemirror({
    ...remirrorProps,
    document: minDocument,
    forceEnvironment: 'ssr',
  });
  const jsonRef = useRef(state.toJSON() as StateJSON);
  const html = useMemo(
    () => createWebViewHtml({ WebViewEditor, bundle, name, json: jsonRef.current }),
    [WebViewEditor, bundle, name],
  );

  return useMemo(() => ({ manager, setState, state, html }), [manager, setState, state, html]);
}

interface BaseNativeRemirrorProps {
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
  WebViewEditor: WebViewEditorType;
}

type UseBridgeHookReturn = ReturnType<typeof useBridge>;

/**
 * The context value which are passed from the webview component to the native
 * view layer on every state update.
 */
export interface NativeRemirrorContext<
  Extension extends AnyExtension = Remirror.Extensions,
  Data extends DefaultBridgeData = DefaultBridgeData,
  Actions extends DefaultBridgeActions = DefaultBridgeActions
> {
  data: Data;
  actions: Actions;
  commands: CommandsFromExtensions<Extension>;
  state: EditorState;
  json: StateJSON;

  /**
   * Add props to the WebView containing the text editor.
   */
  getWebViewProps: GetWebViewProps;
}
export interface NativeRemirrorProps<Extension extends AnyExtension>
  extends NativeRemirrorProviderProps<Extension>,
    I18nProps {}

type GetWebViewProps = (
  extra?: Partial<Exclude<WebViewProps, 'onMessage' | 'source' | 'javascriptEnabled'>>,
) => WebViewProps;
interface NativeRemirrorState {
  registry: Registry;
  json: StateJSON;
  getWebViewProps: GetWebViewProps;
}

interface NativeRemirrorProviderProps<Extension extends AnyExtension>
  extends BaseNativeRemirrorProps {
  /**
   * The manager which is required by the `<Remirror />` component.
   */
  manager: RemirrorManager<Extension>;

  /**
   * The initial editor state based on the provided `content` and `selection`
   * properties. If none were passed in then the state is created from the
   * default empty doc node as defined by the editor Schema.
   */
  initialState?: EditorState<GetSchema<Extension>>;

  /**
   * The HTML webview content.
   */
  html: string;
}

const [NativeRemirrorProvider, useNativeRemirrorContext] = createContextState<
  NativeRemirrorContext,
  NativeRemirrorProviderProps<AnyExtension>,
  NativeRemirrorState
>(
  (helpers) => {
    const { getWebViewProps, json, registry, state } = helpers.state;
    return {
      actions: {},
      commands: {},
      data: {},
      json: {},
      state: {},
      getWebViewProps,
    };
  },
  ({ html, initialState, manager }) => {
    const [json, setJSON] = useState<StateJSON>(() => {
      const fallback = manager.createEmptyDoc();
      const state = initialState ?? manager.createState({ content: fallback });
      return state.toJSON() as StateJSON;
    });

    const stateUpdateBridge: BridgeOption = useCallback((registry) => {
      registry.register(ReactNativeBridgeEvent.StateUpdate, (payload: StateUpdatePayload) => {
        setJSON(payload.state);
      });
    }, []);

    const [ref, onMessage, { registry }] = useBridge();

    const getWebViewProps: GetWebViewProps = useCallback(
      (props) => ({ ...props, ref, onMessage, source: { html } }),
      [ref, onMessage, html],
    );

    return useMemo(
      () => ({
        registry,
        getWebViewProps,
        json,
        state: manager.createState({ content: json.doc, selection: json.selection }),
      }),
      [registry, json, manager, getWebViewProps],
    );
  },
);

/**
 * The react native remirror component which also acts as a provider.
 */
export const NativeRemirror = (props: NativeRemirrorProps): JSX.Element => {
  const { WebViewEditor, bundle, name, i18n, locale, supportedLocales } = props;
  const jsonRef = useRef();
  const source = useMemo(() => createWebViewHtml({ WebViewEditor, bundle, name }), []);
  // const [ref, onMessage] = useBridge((registry) => {
  //   registry.;
  // });

  return (
    <I18nProvider i18n={i18n} locale={locale} supportedLocales={supportedLocales}></I18nProvider>
  );
  // return <WebView source={} />;
};

interface CreateWebViewHtmlProps extends BaseNativeRemirrorProps {
  json: StateJSON;
}

/**
 * Create the WebView html source which pre-rendered HTML.
 */
export function createWebViewHtml(props: CreateWebViewHtmlProps) {
  const { WebViewEditor, bundle, json, name } = props;
  const html = renderToString(<WebViewEditor state={json} />);

  return `<!DOCTYPE html>
  <html lang="en">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <meta http-equiv="X-UA-Compatible" content="ie=edge" />
      <title>This is the webview</title>
    </head>
    <body>
      <div id="${REMIRROR_NATIVE_ID}">${html}</div>
    </body>
  <script>
    ${bundle};
    window.${HYDRATE_COMPONENT_NAME}(${name}, ${JSON.stringify(name)});
  </script>
  </html>\`;
  `;
}
