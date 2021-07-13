/**
 * @module
 *
 * Provide the tools for connecting the rendered editor to the component.
 */
import { createContextState } from 'create-context-state';
import { ComponentType, useEffect, useRef } from 'react';
import { AnyRemirrorManager, EditorState, FromToProps, object, RemirrorJSON } from 'remirror';
import useLayoutEffect from 'use-isomorphic-layout-effect';
import { useEditorState, useRemirrorContext } from '@remirror/react';

import { PLAYGROUND_DEBUG } from '../playground-constants';
import { DebugComponentProps } from '../playground-types';

type DebugMap = Record<string, DebugState>;
export interface DebugState {
  /**
   * Whether or not the editor is currently active. This is set to false when
   * the component is removed from the tree.
   */
  active: boolean;

  /**
   * The manager that can be used.
   */
  manager: AnyRemirrorManager;

  /**
   * The last known state value for the editor.
   */
  state: EditorState;

  /**
   * The last know good json value for the content.
   */
  content: RemirrorJSON;

  /**
   * The current selection point.
   */
  selection: FromToProps;
}

/**
 * The map of debuggable editors exported .
 */
const debugMap: Map<string, DebugState> = window[PLAYGROUND_DEBUG] ?? new Map();
window[PLAYGROUND_DEBUG] = debugMap;

interface PlaygroundContext {
  /**
   * The model which was used to generate the code.
   */
  // model: ModelV1;

  /**
   * The debug map value.
   */
  map: DebugMap;

  /**
   * Updates the debug map to the latest value.
   */
  updateMap: (key: string, manager: AnyRemirrorManager, state: EditorState) => void;

  /**
   * Set's a debuggable editor be inactive.
   */
  setInactive: (key: string) => void;
}

export const [PlaygroundProvider, usePlaygroundContext] = createContextState<PlaygroundContext>(
  ({ set }) => ({
    map: {},
    updateMap: (key, manager, state) => {
      setDebugMap(key, manager, state);
      const map = convertMapToObject(debugMap);
      set({ map });
    },
    setInactive: (key) => {
      setInactiveDebugMap(key);
      const map = convertMapToObject(debugMap);
      set({ map });
    },
    // model: {} as any,
  }),
);

export const PlaygroundSelectors = {
  /**
   * Get the selector by the provided key.
   */
  byKey: (context: PlaygroundContext) => (key: string) => context.map[key],
};

/**
 * Create a debug state from the manager and provided editor state.
 */
function createDebugState(manager: AnyRemirrorManager, state: EditorState): DebugState {
  const { from, to } = state.selection;

  return {
    active: true,
    manager,
    content: state.doc.toJSON() as RemirrorJSON,
    selection: { from, to },
    state,
  };
}

/**
 * Create the debug state from the manager.
 */
function setDebugMap(key: string, manager: AnyRemirrorManager, state: EditorState): void {
  const debugState = createDebugState(manager, state);
  debugMap.set(key, debugState);
}

/**
 * Set the state for a key to inactive.
 */
function setInactiveDebugMap(key: string): void {
  const debugState = debugMap.get(key);

  if (!debugState) {
    return;
  }

  debugMap.set(key, { ...debugState, active: false });
}

/**
 * Convert a JavaScript `Map` to it's object literal representation.
 */
function convertMapToObject<Type>(map: Map<string, Type>): Record<string, Type> {
  const obj: Record<string, Type> = object();

  for (const [key, value] of map.entries()) {
    obj[key] = value;
  }

  return obj;
}

/**
 * Create a debug component for the playground. This component should be added
 * to the Remirror Provider that is rendered inside the playground in order to
 * connect the editor to the debugger.
 */

export function createDebugComponent(name: string): ComponentType<DebugComponentProps> {
  const DebugComponent = (props: DebugComponentProps) => {
    const { manager, setContent } = useRemirrorContext();
    const { updateMap, setInactive, map } = usePlaygroundContext();
    const isFirstMount = useRef(true);
    const isUpdate = useRef(false);
    const state = useEditorState();
    const { prefix } = props;
    const key = name + (prefix ? `-${prefix}` : '');

    // This layout effect is only run when the editor is first rendered. It is
    // responsible for recovering the state from the previous state.
    useLayoutEffect(() => {
      if (!isFirstMount.current) {
        return;
      }

      isFirstMount.current = false;

      const debugState = map[key];

      if (!debugState) {
        return;
      }

      const { content, selection } = debugState;
      const editorState = manager.createState({ content, selection });

      // Force the editor to use the last known good state.
      // setContent(editorState, { triggerChange: false });
      manager.view.updateState(editorState);
    }, [key, manager, map, setContent]);

    useEffect(() => {
      if (!isUpdate.current) {
        isUpdate.current = true;
        return;
      }

      updateMap(key, manager, state);

      // Set the manager from storage to be inactive when the editor is removed.
      return () => {
        setInactive(key);
      };
    }, [key, manager, state, updateMap, setInactive]);

    return null;
  };

  return DebugComponent;
}

declare global {
  interface Window {
    [PLAYGROUND_DEBUG]: Map<string, DebugState>;
  }
}
