import { useCallback, useMemo, useState } from 'react';

import {
  AnyExtension,
  CreateEditorStateProps,
  EditorState,
  ErrorConstant,
  GetSchema,
  invariant,
  RemirrorEventListener,
  RemirrorManager,
} from '@remirror/core';

import type {
  CreateReactManagerOptions,
  ReactExtensionUnion,
  ReactFrameworkOutput,
} from '../react-types';
import { useManager } from './use-manager';

/**
 * Props which are passed into the `useRemirror` hook.
 */
export interface UseRemirrorProps<ExtensionUnion extends AnyExtension>
  extends CreateReactManagerOptions,
    Partial<CreateEditorStateProps> {
  /**
   * Provide a function that returns an array of extensions which will be used
   * to create the manager. If you prefer you can directly provide your own
   * `RemirrorManager` to override this. The manager you provide will be cloned
   * and used within your editor.
   */
  extensions?: (() => ExtensionUnion[]) | RemirrorManager<any>;
}

export interface UseRemirrorReturn<ExtensionUnion extends AnyExtension> {
  /**
   * The manager which is required by the `<Remirror />` component.
   */
  manager: RemirrorManager<ExtensionUnion>;

  /**
   * The initial editor state based on the provided `content` and `selection`
   * properties. If none were passed in then the state is created from the
   * default empty doc node as defined by the editor Schema.
   */
  state: EditorState<GetSchema<ExtensionUnion>>;

  /**
   * A function to update the state when you intend to make the editor
   * controlled.
   *
   * ```ts
   * import React, { useCallback } from 'react';
   * import { useRemirror, Provider } from 'remirror/react';
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
  setState: (state: EditorState<GetSchema<ExtensionUnion>>) => void;

  /**
   * Syntactic sugar for using the `setState` method directly on the `<Remirror
   * />` component.
   *
   * ```ts
   * import React from 'react';
   * import { useRemirror, Provider } from 'remirror/react';
   * import { htmlToProsemirrorNode } from 'remirror';
   *
   * const Editor = () => {
   *   const { manager, onChange, state } = useRemirror({
   *     content: '<p>Some content</p>',
   *     stringHandler: htmlToProsemirrorNode
   *   });
   *
   *   return <Remirror onChange={onChange} state={state} manager={manager} />
   * }
   * ```
   */
  onChange: RemirrorEventListener<ExtensionUnion>;

  /**
   * A function that provides the editor context. This is only available after
   * the `<Remirror />` component is mounted. Calling it in the very first
   * render phase will cause an error to be thrown.
   */
  getContext: () => ReactFrameworkOutput<ExtensionUnion> | undefined;
}

/**
 * A hook which replaces the [[`Remirror`]] and gives you total control of
 * the editor you can create.
 *
 * This is very experimental and if successful could replace the current
 * patterns being used.
 */
export function useRemirror<ExtensionUnion extends AnyExtension>(
  props: UseRemirrorProps<ExtensionUnion> = {},
): UseRemirrorReturn<ReactExtensionUnion<ExtensionUnion>> {
  const { content, document, selection, extensions, ...settings } = props;
  const manager = useManager(extensions ?? (() => []), settings);

  const [state, setState] = useState(() =>
    manager.createState({
      document,
      selection,
      stringHandler: settings.stringHandler,
      onError: settings.onError,
      content: content ?? manager.createEmptyDoc(),
    }),
  );

  const onChange: RemirrorEventListener<ExtensionUnion> = useCallback(({ state }) => {
    setState(state);
  }, []);

  const getContext = useCallback(() => {
    const context: unknown = manager.output;
    return context as ReactFrameworkOutput<ReactExtensionUnion<ExtensionUnion>>;
  }, [manager]);

  // Memoize the return to prevent unnecessary re-renders when props change.
  return useMemo(() => ({ state, setState, manager, onChange, getContext }), [
    getContext,
    manager,
    onChange,
    state,
  ]);
}
