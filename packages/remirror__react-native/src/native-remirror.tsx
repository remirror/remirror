import { createContextState } from 'create-context-state';
import delay from 'delay';
import { BridgeOption, Registry, useBridge } from 'lepont';
import minDocument from 'min-document';
import { ReactNode, useCallback, useMemo, useRef, useState } from 'react';
import { renderToString } from 'react-dom/server';
import WebView, { WebViewProps } from 'react-native-webview';
import {
  AnyExtension,
  AnyFunction,
  EMPTY_ARRAY,
  Except,
  GetSchema,
  RemirrorManager,
  Shape,
  StateJSON,
  uniqueId,
} from '@remirror/core';
import {
  CommandDonePayload,
  CommandPayload,
  HYDRATE_COMPONENT_NAME,
  ReactNativeBridgeEvent,
  ReactNativeBridgeExtension,
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
  extends Except<UseRemirrorProps<Extension>, 'extensions' | 'document' | 'forceEnvironment'> {
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
}

export function useNativeRemirror<Extension extends AnyExtension>(
  props: UseNativeRemirrorProps<Extension>,
): UseNativeRemirrorReturn<ReactExtensions<Extension>> {
  return useRemirror({
    ...props,
    document: minDocument,
    forceEnvironment: 'ssr',
  });
}

interface BaseNativeRemirrorProps {
  /**
   * The bundled editor which will be placed within the.
   *
   * ```ts
   * import { bundleWithRollup } from 'bundler.macro';
   *
   * const bundle = bundleWithRollup('./path/to/editor.tsx');
   * ```
   */
  bundle: string;

  /**
   * The editor component that was bundled into a string. It takes no props and
   * is used to create an SSR render of the component to prevent the flash of
   * unstyled content in the webview that is rendered.
   */
  WebViewEditor: WebViewEditorType;
}

/**
 * The context value which are passed from the webview component to the native
 * view layer on every state update.
 */
export interface NativeRemirrorContext {
  data: Shape;
  actions: AsyncCommands;
  commands: AsyncCommands;
  state: EditorState;
  json: StateJSON;

  /**
   * Add props to the WebView containing the text editor.
   */
  getWebViewProps: GetWebViewProps;
}
export interface NativeRemirrorProps<Extension extends AnyExtension>
  extends NativeRemirrorProviderProps<Extension>,
    I18nProps {
  /**
   * The optional children which can be passed into the [`Remirror`].
   */
  children?: ReactNode;

  /**
   * Set this to `start` or `end` to automatically render the editor to the dom.
   *
   * When set to `start` the editor will be added before all other child
   * components. If `end` the editable editor will be added after all child
   * components.
   *
   * When no children are provided the editor will automatically be rendered
   * even without this prop being set.
   *
   * `start` is the preferred value since it helps avoid some of the issues that
   * can arise from `zIndex` issues with floating components rendered within the
   * context.
   *
   * @default undefined
   */
  autoRender?: boolean | 'start' | 'end';

  /**
   * An array of hooks that can be passed through to the `Remirror` component
   * and will be called in the order provided. Each hook receives no props but
   * will have access to the `RemirrorContext`.
   *
   * If you'd like access to more
   * state, you can wrap the `Remirror` component in a custom provider and
   * attach your state there. It can then be accessed inside the hook via
   * context.
   */
  hooks?: Array<() => void>;
}

type GetWebViewProps = (
  extra?: Partial<Exclude<WebViewProps, 'onMessage' | 'source' | 'javascriptEnabled'>>,
) => WebViewProps;
interface NativeRemirrorState {
  registry: Registry;
  json: StateJSON;
  getWebViewProps: GetWebViewProps;
  data: Shape;
  state: EditorState;
}

interface NativeRemirrorProviderProps<Extension extends AnyExtension>
  extends BaseNativeRemirrorProps {
  /**
   * The manager which is required by the `<Remirror />` component.
   */
  manager: RemirrorManager<any>;

  /**
   * The initial editor state based on the provided `content` and `selection`
   * properties. If none were passed in then the state is created from the
   * default empty doc node as defined by the editor Schema.
   */
  initialState?: EditorState<GetSchema<Extension>>;
}

export const [NativeRemirrorProvider, useNativeRemirrorContext] = createContextState<
  NativeRemirrorContext,
  NativeRemirrorProviderProps<AnyExtension>,
  NativeRemirrorState
>(
  (helpers) => {
    const { getWebViewProps, json, registry, data, state } = helpers.state;
    const { manager } = helpers.props;
    const actionNames = Object.keys(
      manager.getExtension(ReactNativeBridgeExtension).options.actions,
    );
    const {
      // Only set the commands the very first time this is loaded since they
      // don't change for the editor.
      commands = createCommands(
        Object.keys(manager.store.commands),
        registry,
        ReactNativeBridgeEvent.Command,
      ),

      // Only set the actions once since they don't change during the editor
      // lifecycle.
      actions = createCommands(actionNames, registry, ReactNativeBridgeEvent.Action),
    } = helpers.previousContext ?? {};

    return {
      actions,
      commands,
      data,
      json,
      state,
      getWebViewProps,
    };
  },
  (props) => {
    const { initialState, manager, WebViewEditor, bundle } = props;
    const [payload, setPayload] = useState<StateUpdatePayload>(() => {
      const bridgeExtension = manager.getExtension(ReactNativeBridgeExtension);
      const fallback = manager.createEmptyDoc();
      const state = initialState ?? manager.createState({ content: fallback });
      const data = bridgeExtension.generateData(state);

      return { data, state: state.toJSON() as StateJSON };
    });

    const jsonRef = useRef(payload.state);
    const html = useMemo(
      () => createWebViewHtml({ WebViewEditor, bundle, json: jsonRef.current }),
      [WebViewEditor, bundle],
    );

    const stateUpdateBridge: BridgeOption = useCallback((registry) => {
      registry.register(ReactNativeBridgeEvent.StateUpdate, (payload: StateUpdatePayload) => {
        setPayload(payload);
      });
    }, []);

    const [ref, onMessage, { registry }] = useBridge(stateUpdateBridge);
    const getWebViewProps: GetWebViewProps = useCallback(
      (props) => ({ ...props, ref, onMessage, source: { html } }),
      [ref, onMessage, html],
    );

    jsonRef.current = payload.state;

    return useMemo(
      () => ({
        registry,
        getWebViewProps,
        json: payload.state,
        data: payload.data,
        state: manager.createState({
          content: payload.state.doc,
          selection: payload.state.selection,
        }),
      }),
      [registry, manager, getWebViewProps, payload],
    );
  },
);

interface HookComponentProps {
  /**
   * The hook that will be run within the `RemirrorContext`. For access to other
   * contexts, wrap the `<Remirror />` within other contexts and access their
   * values with `useContext`.
   */
  hook: () => void;
}

/**
 * A component which exists to call a prop-less hook.
 */
const HookComponent = (props: HookComponentProps) => {
  props.hook();
  return null;
};

/**
 * The react native remirror component which also acts as a provider.
 */
export function NativeRemirror<Extension extends AnyExtension = Remirror.Extensions>(
  props: NativeRemirrorProps<Extension>,
): JSX.Element {
  const {
    WebViewEditor,
    bundle,
    i18n,
    locale,
    supportedLocales,
    children,
    manager,
    initialState,
    autoRender,
    hooks = EMPTY_ARRAY,
  } = props;
  // A boolean flag which is true when a default editor should be rendered
  // first. If no children are provided and no configuration is provided for
  // autoRender, the editor will automatically be rendered.
  const autoRenderAtStart =
    autoRender === 'start' || autoRender === true || (!children && autoRender == null);

  // Whether to render the editor at the end of the editor.
  const autoRenderAtEnd = autoRender === 'end';

  return (
    <I18nProvider i18n={i18n} locale={locale} supportedLocales={supportedLocales}>
      <NativeRemirrorProvider
        WebViewEditor={WebViewEditor}
        bundle={bundle}
        manager={manager}
        initialState={initialState}
      >
        {hooks.map((hook, index) => (
          <HookComponent hook={hook} key={index} />
        ))}
        {autoRenderAtStart && <AutoWebView />}
        {children}
        {autoRenderAtEnd && <AutoWebView />}
        {children}
      </NativeRemirrorProvider>
    </I18nProvider>
  );
}

/**
 * A component which adds the WebView containing the remirror editor into the
 * component tree.
 */
export const AutoWebView = (): JSX.Element => {
  const { getWebViewProps } = useNativeRemirrorContext();

  return <WebView {...getWebViewProps()} />;
};

interface CreateWebViewHtmlProps extends BaseNativeRemirrorProps {
  json: StateJSON;
}

/**
 * Create the commands object that creates an async bridge to dispatch commands
 * within the dom editor.
 */
function createCommands(
  names: string[],
  registry: Registry,
  type: typeof ReactNativeBridgeEvent.Command | typeof ReactNativeBridgeEvent.Action,
): AsyncCommands {
  const commands: Record<string, AnyFunction<Promise<void>>> = {};

  for (const name of names) {
    commands[name] = (...args: any[]) => {
      return new Promise((resolve, reject) => {
        const responseType = `${type}:${name}:${uniqueId()}`;

        registry.register(responseType, (payload: CommandDonePayload) => {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete registry.registry[responseType];

          if (payload.success) {
            resolve();
          } else {
            reject();
          }
        });

        delay(800).then(() => {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete registry.registry[responseType];
          reject();
        });

        registry.sendMessage<CommandPayload>({
          type,
          payload: { name, args, responseType },
        });
      });
    };
  }

  return commands;
}

/**
 * Create the WebView html source which pre-rendered HTML.
 */
function createWebViewHtml(props: CreateWebViewHtmlProps): string {
  const { WebViewEditor, bundle, json } = props;
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
    window.${HYDRATE_COMPONENT_NAME}(__ROLLUP_BUNDLER_MACRO__['default'], ${JSON.stringify(json)});
  </script>
  </html>\`;
  `;
}

type AsyncCommands = Record<string, AnyFunction<Promise<void>>>;
