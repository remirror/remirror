import { useCallback, useEffect, useRef, useState } from 'react';
import useLayoutEffect from 'use-isomorphic-layout-effect';
import usePrevious from 'use-previous';

import {
  AnyExtension,
  ErrorConstant,
  getDocument,
  GetSchema,
  invariant,
  isArray,
  isNullOrUndefined,
  PrimitiveSelection,
  RemirrorContentType,
} from '@remirror/core';
import type { EditorState } from '@remirror/pm/state';
import { ReactExtension } from '@remirror/preset-react';

import { ReactFramework, ReactFrameworkOptions, ReactFrameworkProps } from '../react-framework';
import type { ReactFrameworkOutput } from '../react-types';

/**
 * The hook responsible for providing the editor context when the `Remirror`
 * component is combined with `useRemirror`.
 *
 * @remarks
 *
 * This is an internal hook which returns the `ReactFramework` instance for
 * consumption by the public API's. It is used within `useRemirror` and the
 * `<Remirror />` component.
 *
 * @internal
 */
export function useReactFramework<Extension extends AnyExtension>(
  props: ReactFrameworkProps<Extension>,
): ReactFrameworkOutput<Extension> {
  const {
    onError,
    manager,
    forceEnvironment,
    state,
    stringHandler = manager.settings.stringHandler ?? defaultStringHandler,
  } = props;
  const { placeholder } = props;
  const firstUpdate = useRef(true);

  // Update the placeholder on first render.
  if (firstUpdate.current && !isNullOrUndefined(placeholder)) {
    manager.getExtension(ReactExtension).setOptions({ placeholder });
  }

  // Keep the placeholder updated
  useEffect(() => {
    manager.getExtension(ReactExtension).setOptions({ placeholder });
  }, [placeholder, manager]);

  const createStateFromContent = useCallback(
    (
      content: RemirrorContentType,
      selection?: PrimitiveSelection,
    ): EditorState<GetSchema<Extension>> => {
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
  const initialEditorState = state
    ? state
    : createStateFromContent(initialContent, initialSelection);
  const [shouldRenderClient, setShouldRenderClient] = useState<boolean | undefined>(
    props.suppressHydrationWarning ? false : undefined,
  );

  // Store all the `logic` in a `ref`
  const framework: ReactFramework<Extension> = useFramework<Extension>({
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
function useFramework<Extension extends AnyExtension>(
  props: ReactFrameworkOptions<Extension>,
): ReactFramework<Extension> {
  const propsRef = useRef(props);
  propsRef.current = props;

  const [framework, setFramework] = useState(() => new ReactFramework<Extension>(propsRef.current));

  framework.update(props);

  useEffect(() => {
    return framework.frameworkOutput.addHandler('destroy', () => {
      setFramework(() => new ReactFramework<Extension>(propsRef.current));
    });
  }, [framework]);

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
      'No valid string handler. In order to pass in a `string` as `initialContent` you must provide a valid `stringHandler` prop',
  });
}

/**
 * A hook which manages the controlled updates for the editor.
 */
function useControlledEditor<Extension extends AnyExtension>(
  framework: ReactFramework<Extension>,
): void {
  const { state } = framework.props;

  // Cache whether this is a controlled editor.
  const isControlledRef = useRef(!!state);
  const previousValue = usePrevious(state);

  // Using layout effect for synchronous updates.
  useLayoutEffect(() => {
    // Check if the update is valid based on current value.
    const validUpdate = state
      ? isControlledRef.current === true
      : isControlledRef.current === false;

    invariant(validUpdate, {
      code: ErrorConstant.REACT_CONTROLLED,
      message: isControlledRef.current
        ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `value` prop.'
        : 'You have provided a `value` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `value` prop from the very first render.',
    });

    if (!state || state === previousValue) {
      return;
    }

    framework.updateControlledState(state, previousValue ?? undefined);
  }, [state, previousValue, framework]);
}
