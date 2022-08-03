import { useEffect, useMemo, useRef, useState } from 'react';
import { AnyExtension, ErrorConstant, invariant, isArray, isNullOrUndefined } from '@remirror/core';
import { ReactExtension } from '@remirror/preset-react';

import { ReactFramework, ReactFrameworkOptions, ReactFrameworkProps } from '../react-framework';
import type { ReactFrameworkOutput } from '../react-types';
import { useIsomorphicLayoutEffect } from './use-isomorphic-layout-effect';
import { usePrevious } from './use-previous';

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
  const { manager, state } = props;
  const { placeholder, editable } = props;

  const firstUpdate = useRef(true);

  // Update the placeholder on first render.
  if (firstUpdate.current && !isNullOrUndefined(placeholder)) {
    manager.getExtension(ReactExtension).setOptions({ placeholder });
  }

  // Keep the placeholder updated
  useEffect(() => {
    // Only update the placeholder if the passed placeholder is not null or
    // undefined, which is the default value for this prop. By doing that, we
    // can make sure that if a PlaceholderExtension is provided in the extension
    // list, we won't override its options.
    if (placeholder == null) {
      return;
    }

    manager.getExtension(ReactExtension).setOptions({ placeholder });
  }, [placeholder, manager]);

  const [initialEditorState] = useState(() => {
    if (state) {
      return state;
    }

    const fallback = manager.createEmptyDoc();

    const [initialContent, initialSelection] = isArray(props.initialContent)
      ? props.initialContent
      : ([props.initialContent ?? fallback] as const);

    return manager.createState({ content: initialContent, selection: initialSelection });
  });

  // Create the framework which manages the connection between the `@remirror/core`
  // and React.
  const framework: ReactFramework<Extension> = useFramework<Extension>({
    initialEditorState,
    getProps: () => props,
  });

  useEffect(() => {
    return () => {
      framework.destroy();
    };
  }, [framework]);

  // Handle editor updates
  useEffect(() => {
    framework.onUpdate();
  }, [editable, framework]);

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

  const framework = useMemo(() => new ReactFramework<Extension>(propsRef.current), []);
  framework.update(props);

  return framework;
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
  useIsomorphicLayoutEffect(() => {
    // Check if the update is valid based on current value.
    const validUpdate = state
      ? isControlledRef.current === true
      : isControlledRef.current === false;

    invariant(validUpdate, {
      code: ErrorConstant.REACT_CONTROLLED,
      message: isControlledRef.current
        ? 'You have attempted to switch from a controlled to an uncontrolled editor. Once you set up an editor as a controlled editor it must always provide a `state` prop.'
        : 'You have provided a `state` prop to an uncontrolled editor. In order to set up your editor as controlled you must provide the `state` prop from the very first render.',
    });

    if (!state || state === previousValue) {
      return;
    }

    framework.updateControlledState(state, previousValue ?? undefined);
  }, [state, previousValue, framework]);
}
