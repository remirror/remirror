import React, { ReactElement, useCallback, useEffect, useRef, useState } from 'react';
import { useFirstMountState } from 'react-use/lib/useFirstMountState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';

import {
  AnyCombinedUnion,
  bool,
  ErrorConstant,
  getDocument,
  invariant,
  isArray,
  isNullOrUndefined,
  PrimitiveSelection,
  RemirrorContentType,
  SchemaFromCombined,
} from '@remirror/core';
import { RemirrorPortals, usePortals } from '@remirror/extension-react-component';
import type { EditorState } from '@remirror/pm/state';
import { ReactPreset } from '@remirror/preset-react';
import { RemirrorType } from '@remirror/react-utils';

import { usePrevious } from '../hooks';
import { ReactFramework, ReactFrameworkParameter, ReactFrameworkProps } from '../react-framework';

/**
 * The component responsible for rendering your prosemirror editor to the DOM.
 *
 * @remarks
 *
 * This is an internal component and should only be used within the `remirror`
 * codebase. The `RemirrorProvider` is the only supported way for consuming the
 * application.
 *
 * @internal
 */
export const ReactEditor = <Combined extends AnyCombinedUnion>(
  props: ReactFrameworkProps<Combined>,
): ReactElement<ReactFrameworkProps<Combined>> => {
  const { stringHandler = defaultStringHandler, onError, manager, forceEnvironment, value } = props;
  const { placeholder } = props;
  const isFirstMount = useFirstMountState();

  // Update the placeholder on first render.
  if (isFirstMount && !isNullOrUndefined(placeholder)) {
    manager.getPreset(ReactPreset).setOptions({ placeholder });
  }

  // Keep the placeholder updated
  useUpdateEffect(() => {
    if (isNullOrUndefined(placeholder)) {
      return;
    }

    manager.getPreset(ReactPreset).setOptions({ placeholder });
  }, [placeholder, manager]);

  const createStateFromContent = useCallback(
    (
      content: RemirrorContentType,
      selection?: PrimitiveSelection,
    ): EditorState<SchemaFromCombined<Combined>> => {
      return manager.createState({
        content,
        document: getDocument(forceEnvironment),
        stringHandler,
        selection,
        onError,
      });
    },
    [onError, forceEnvironment, manager, stringHandler],
  );

  const fallback = manager.createEmptyDoc();
  const [initialContent, initialSelection] = isArray(props.initialContent)
    ? props.initialContent
    : ([props.initialContent ?? fallback] as const);
  const initialEditorState = bool(value)
    ? value
    : createStateFromContent(initialContent, initialSelection);
  const [shouldRenderClient, setShouldRenderClient] = useState<boolean | undefined>(
    props.suppressHydrationWarning ? false : undefined,
  );

  // Store all the `logic` in a `ref`
  const framework: ReactFramework<Combined> = useFramework<Combined>({
    initialEditorState,
    setShouldRenderClient,
    createStateFromContent,
    getProps: () => props,
    getShouldRenderClient: () => shouldRenderClient,
  });

  useEffect(() => {
    framework.onMount();

    return () => {
      framework.destroy();
    };
  }, [framework]);

  const previousEditable = usePrevious(props.editable);

  // Handle editor updates
  useEffect(() => {
    framework.onUpdate(previousEditable);
  }, [previousEditable, framework]);

  // Handle the controlled editor usage.
  useControlledEditor(framework);

  // Subscribe to updates from the [[`PortalContainer`]]
  const portals = usePortals(framework.frameworkOutput.portalContainer);

  // Return the rendered component and the portals for custom node views and
  // decorations
  return (
    <>
      {framework.generateReactElement()}
      <RemirrorPortals portals={portals} context={framework.frameworkOutput} />
    </>
  );
};

/**
 * Sets a flag to be a static remirror
 */
ReactEditor.remirrorType = RemirrorType.Editor;

/**
 * A hook which creates a reference to the `ReactFramework` and updates the
 * parameters on every render.
 */
function useFramework<Combined extends AnyCombinedUnion>(
  parameter: ReactFrameworkParameter<Combined>,
): ReactFramework<Combined> {
  const parameterRef = useRef(parameter);
  parameterRef.current = parameter;

  const [editorWrapper, setFramework] = useState(
    () => new ReactFramework<Combined>(parameterRef.current),
  );

  editorWrapper.update(parameter);

  useEffect(() => {
    editorWrapper.props.manager.addHandler('destroy', () => {
      setFramework(() => new ReactFramework<Combined>(parameterRef.current));
    });
  }, [editorWrapper.props.manager]);

  return editorWrapper;
}

/**
 * If no string handler is provided, but the user tries to provide a string as
 * content then throw an error.
 */
function defaultStringHandler(): never {
  invariant(false, {
    code: ErrorConstant.REACT_EDITOR_VIEW,
    message:
      'No valid string handler. In order to pass in `string` as `initialContent` to the remirror editor you must provide a valid stringHandler prop',
  });
}

/**
 * A hook which manages the controlled updates for the editor.
 */
function useControlledEditor<Combined extends AnyCombinedUnion>(
  framework: ReactFramework<Combined>,
): void {
  const { value } = framework.props;

  // Cache whether this is a controlled editor.
  const isControlled = useRef(bool(value)).current;
  const previousValue = usePrevious(value);

  // Check if the update is valid based on current value.
  const validUpdate = value ? isControlled === true : isControlled === false;

  invariant(validUpdate, {
    code: ErrorConstant.REACT_CONTROLLED,
    message: isControlled
      ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `value` prop.'
      : 'You have provided a `value` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `value` prop from the very first render.',
  });

  if (!value || value === previousValue) {
    return;
  }

  // **NOTE:** This is required for controlled updates to work properly (to the
  // best of my knowledge). If, for example, we try `useEffect` instead
  // controlled updates are asynchronous and there can be mismatched
  // transactions caused by React's state representation being one step behind
  // ProseMirror.
  //
  // One issue that I'm bumping into right now while working on the
  // `ReactNodeView` is that when the `view.updateState()` causes a rerender in
  // a sub-component it triggers the warning - 'Cannot update a component [`X`]
  // while rendering a different component [`ReactEditor`]'.
  //
  // This is because rendering one component should not attempt to update the
  // state of a different component while rendering. NodeView's are called as soon
  // as `view.updateState` is called and the NodeView is updated via a synchronous event listener which triggers a `setState` causing the
  framework.updateControlledState(value, previousValue ?? undefined);
}
