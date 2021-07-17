import { useCallback, useMemo, useState } from 'react';
import {
  AnyExtension,
  CreateEditorStateProps,
  EditorState,
  GetSchema,
  InvalidContentHandler,
  RemirrorEventListener,
  RemirrorManager,
  StringHandler,
} from '@remirror/core';

import type {
  CreateReactManagerOptions,
  ReactExtensions,
  ReactFrameworkOutput,
} from '../react-types';
import { useManager } from './use-manager';

/**
 * Props which are passed into the `useRemirror` hook.
 */
export interface UseRemirrorProps<Extension extends AnyExtension>
  extends CreateReactManagerOptions,
    Partial<CreateEditorStateProps> {
  /**
   * Provide a function that returns an array of extensions which will be used
   * to create the manager. If you prefer you can directly provide your own
   * `RemirrorManager` to override this. The manager you provide will be cloned
   * and used within your editor.
   *
   * When a `Manager` is provided then several settings are ignored like
   * [[`stringHandler`]] and [[`onError`]].
   */
  extensions?: (() => Extension[]) | RemirrorManager<any>;

  /**
   * This is called when the editor has invalid content.
   *
   * @remarks
   *
   * To add this to the editor the following is needed.
   *
   * ```tsx
   * import React from 'react';
   * import { Remirror, InvalidContentHandler } from 'remirror';
   * import { Remirror, useManager } from '@remirror/react';
   * import { WysiwygPreset } from 'remirror/extensions';
   *
   * const Framework = () => {
   *   const onError: InvalidContentHandler = useCallback(({ json, invalidContent, transformers }) => {
   *     // Automatically remove all invalid nodes and marks.
   *     return transformers.remove(json, invalidContent);
   *   }, []);
   *
   *   const manager = useManager(() => [new WysiwygPreset()]);
   *
   *   return (
   *     <Remirror manager={manager} onError={onError}>
   *       <div />
   *     </Remirror>
   *   );
   * };
   * ```
   */
  onError?: InvalidContentHandler;

  /**
   * A function which transforms a string into a prosemirror node.
   *
   * @remarks
   *
   * Can be used to transform markdown / html or any other string format into a
   * prosemirror node.
   *
   * See [[`fromHTML`]] for an example of how this could work.
   */
  stringHandler?: keyof Remirror.StringHandlers | StringHandler;
}

export interface UseRemirrorReturn<Extension extends AnyExtension> {
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
   * Syntactic sugar for using the `setState` method directly on the `<Remirror
   * />` component.
   *
   * ```ts
   * import React from 'react';
   * import { useRemirror, Provider } from '@remirror/react';
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
  onChange: RemirrorEventListener<Extension>;

  /**
   * A function that provides the editor context. This is only available after
   * the `<Remirror />` component is mounted. Calling it in the very first
   * render phase will cause an error to be thrown.
   */
  getContext: () => ReactFrameworkOutput<Extension> | undefined;
}

/**
 * A hook which replaces the [[`Remirror`]] and gives you total control of
 * the editor you can create.
 *
 * This is very experimental and if successful could replace the current
 * patterns being used.
 */
export function useRemirror<Extension extends AnyExtension>(
  props: UseRemirrorProps<Extension> = {},
): UseRemirrorReturn<ReactExtensions<Extension>> {
  const { content, document, selection, extensions, ...settings } = props;
  const manager = useManager(extensions ?? (() => []), settings);

  const [state, setState] = useState(() =>
    manager.createState({
      selection,
      content: content ?? manager.createEmptyDoc(),
    }),
  );

  const onChange: RemirrorEventListener<Extension> = useCallback(({ state }) => {
    setState(state);
  }, []);

  const getContext = useCallback(() => {
    const context: unknown = manager.output;
    return context as ReactFrameworkOutput<ReactExtensions<Extension>>;
  }, [manager]);

  // Memoize the return to prevent unnecessary re-renders when props change.
  return useMemo(
    () => ({ state, setState, manager, onChange, getContext }),
    [getContext, manager, onChange, state],
  );
}
