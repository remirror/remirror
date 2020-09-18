import { useCallback, useEffect, useRef, useState } from 'react';
import { useFirstMountState } from 'react-use/lib/useFirstMountState';
import useUpdateEffect from 'react-use/lib/useUpdateEffect';
import useLayoutEffect from 'use-isomorphic-layout-effect';

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
import type { EditorState } from '@remirror/pm/state';
import { ReactPreset } from '@remirror/preset-react';

import { ReactFramework, ReactFrameworkParameter, ReactFrameworkProps } from '../react-framework';
import type { ReactFrameworkOutput } from '../react-types';
import { usePrevious } from './core-hooks';

/**
 * The hook responsible for providing the editor context to the `RemirrorProvider`.
 *
 * @remarks
 *
 * This is an internal component and should only be used within the `remirror`
 * codebase. The `RemirrorProvider` is the only supported way for consuming the
 * application.
 *
 * @internal
 */
export function useReactEditor<Combined extends AnyCombinedUnion>(
  props: ReactFrameworkProps<Combined>,
): ReactFrameworkOutput<Combined> {
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

  return framework.frameworkOutput;
}

/**
 * A hook which creates a reference to the `ReactFramework` and updates the
 * parameters on every render.
 */
function useFramework<Combined extends AnyCombinedUnion>(
  parameter: ReactFrameworkParameter<Combined>,
): ReactFramework<Combined> {
  const parameterRef = useRef(parameter);
  parameterRef.current = parameter;

  const [framework, setFramework] = useState(
    () => new ReactFramework<Combined>(parameterRef.current),
  );

  framework.update(parameter);

  useEffect(() => {
    framework.props.manager.addHandler('destroy', () => {
      setFramework(() => new ReactFramework<Combined>(parameterRef.current));
    });
  }, [framework.props.manager]);

  return framework;
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
  const isControlledRef = useRef(bool(value));
  const previousValue = usePrevious(value);

  // Using layout effect for synchronous updates.
  useLayoutEffect(() => {
    // Check if the update is valid based on current value.
    const validUpdate = value
      ? isControlledRef.current === true
      : isControlledRef.current === false;

    invariant(validUpdate, {
      code: ErrorConstant.REACT_CONTROLLED,
      message: isControlledRef.current
        ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `value` prop.'
        : 'You have provided a `value` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `value` prop from the very first render.',
    });

    if (!value || value === previousValue) {
      return;
    }

    framework.updateControlledState(value, previousValue ?? undefined);
  }, [value, previousValue, framework]);
}
