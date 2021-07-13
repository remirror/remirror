import { DependencyList, useMemo } from 'react';
import {
  AddHandler,
  AnyExtensionConstructor,
  CustomHandlerMethod,
  Dispose,
  DynamicOptionsOfConstructor,
  isFunction,
  OptionsOfConstructor,
} from '@remirror/core';

import { useEffectWithWarning } from './use-effect-with-warning';
import { useRemirrorContext } from './use-remirror-context';

/**
 * Dynamically update the properties of your extension via hooks. Provide the
 * Extension constructor and the properties you want to update.
 *
 * @remarks
 *
 * Please note that every time the properties change your extension is updated.
 * You will want to memoize or prevent needless updates somehow to the
 * properties passed in.
 *
 * This is only available within the context of the `Remirror` it will
 * throw an error otherwise.
 *
 * It can be used with three distinct call signatures.
 *
 * **Get the extension instance**
 *
 * ```tsx
 * import { useExtension } from '@remirror/react';
 * import { BoldExtension } from 'remirror/extensions';
 *
 * const Editor = () => {
 *   const boldExtension = useExtension(BoldExtension);
 *
 *   boldExtension.setOptions({ weight: '800' });
 *
 *   return null;
 * }
 * ```
 *
 * **Update the extension properties**
 *
 * ```tsx
 * import { useExtension } from '@remirror/react';
 * import { PlaceholderExtension } from 'remirror/extensions';
 *
 * const EditorPlaceholder = ({ placeholder = 'Your magnum opus' }) => {
 *   useExtension(PlaceholderExtension, { placeholder }); // Updates the placeholder.
 *
 *   return null;
 * }
 * ```
 *
 * **Add event handlers to your extension**
 *
 * ```tsx
 * import { useCallback } from 'react';
 * import { HistoryExtension, HistoryOptions } from 'remirror/extensions';
 * import { useExtension } from '@remirror/react';
 *
 * const Editor = ({ placeholder = 'Your magnum opus' }) => {
 *   useExtension(
 *     HistoryExtension,
 *     useCallback(
 *       ({ addHandler }) => {
 *         return addHandler('onRedo', () => log('a redo just happened'));
 *       },
 *       [],
 *     ),
 *     [event, handler],
 *   );
 *
 *   return null;
 * };
 * ```
 *
 * These hooks can serve as the building blocks when customizing your editor
 * experience with `remirror`.
 */
export function useExtension<Type extends AnyExtensionConstructor>(
  Constructor: Type,
): InstanceType<Type>;
export function useExtension<Type extends AnyExtensionConstructor>(
  Constructor: Type,
  options: DynamicOptionsOfConstructor<Type>,
): void;
export function useExtension<Type extends AnyExtensionConstructor>(
  Constructor: Type,
  method: UseExtensionCallback<Type>,
  dependencies: DependencyList,
): void;
export function useExtension<Type extends AnyExtensionConstructor>(
  Constructor: Type,
  optionsOrCallback:
    | DynamicOptionsOfConstructor<Type>
    | UseExtensionCallback<Type>
    // eslint-disable-next-line unicorn/no-useless-undefined
    | undefined = undefined,
  dependencies: DependencyList = [],
): InstanceType<Type> | void {
  const { getExtension } = useRemirrorContext();
  const extension = useMemo(() => getExtension(Constructor), [Constructor, getExtension]);
  const deps = isFunction(optionsOrCallback)
    ? [extension, ...dependencies]
    : optionsOrCallback
    ? [extension, ...Object.values(optionsOrCallback)]
    : [];

  // Handle the case where an options object is passed in.
  useEffectWithWarning(() => {
    if (isFunction(optionsOrCallback) || !optionsOrCallback) {
      return;
    }

    extension.setOptions(optionsOrCallback);
  }, deps);

  useEffectWithWarning(() => {
    if (!isFunction(optionsOrCallback)) {
      return;
    }

    return optionsOrCallback({
      addHandler: extension.addHandler.bind(extension),
      addCustomHandler: extension.addCustomHandler.bind(extension),
      extension,
    });
  }, deps);

  // Return early when more than one argument received.
  if (optionsOrCallback) {
    return;
  }

  return extension;
}

interface UseExtensionCallbackProps<Type extends AnyExtensionConstructor> {
  /**
   * Add a handler to the the extension callback.
   *
   * ```ts
   * addHandler('onChange', () => log('changed'));
   * ```
   */
  addHandler: AddHandler<OptionsOfConstructor<Type>>;

  /**
   * Set the value of a custom option which returns a dispose method. The custom
   * value is handled internally by the extension.
   *
   * ```ts
   * addCustomHandler('keybindings', { Enter: () => false });
   * ```
   */
  addCustomHandler: CustomHandlerMethod<OptionsOfConstructor<Type>>;

  /**
   * An instance of the extension. This can be used for more advanced scenarios.
   */
  extension: InstanceType<Type>;
}

export type UseExtensionCallback<Type extends AnyExtensionConstructor> = (
  props: UseExtensionCallbackProps<Type>,
) => Dispose | undefined;
