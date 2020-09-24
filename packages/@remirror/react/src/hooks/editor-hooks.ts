import { DependencyList, useContext, useEffect, useMemo, useRef, useState } from 'react';

import {
  AddHandler,
  AnyCombinedUnion,
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BuiltinPreset,
  CustomHandlerMethod,
  Dispose,
  DynamicOptionsOfConstructor,
  ErrorConstant,
  invariant,
  isFunction,
  isPlainObject,
  OptionsOfConstructor,
  RemirrorEventListener,
  RemirrorManager,
} from '@remirror/core';
import { usePortalContext } from '@remirror/extension-react-component';
import type { CorePreset } from '@remirror/preset-core';
import type { ReactPreset } from '@remirror/preset-react';

import { I18nContext, RemirrorContext } from '../react-contexts';
import { createReactManager } from '../react-helpers';
import type {
  CreateReactManagerOptions,
  DefaultReactCombined,
  I18nContextProps,
  ReactCombinedUnion,
  ReactFrameworkOutput,
} from '../react-types';
import { useEffectWithWarning, useForceUpdate } from './core-hooks';

/**
 * This provides access to the Remirror context using hooks.
 *
 * The first argument which is optional can also be a change handler which is
 * called every time the state updates.
 *
 * @remarks
 *
 * The following example applies the root props to the div.
 * ```ts
 * import { RemirrorProvider, useRemirror } from 'remirror';
 *
 * const HooksComponent = (props) => {
 *   // This pulls the remirror props out from the context.
 *   const { getRootProps } = useRemirror();
 *
 *   return <div {...getRootProps()} />;
 * }
 *
 * class App extends Component {
 *   render() {
 *     return (
 *       <RemirrorProvider>
 *         <HooksComponent />
 *       </RemirrorProvider>
 *     );
 *   }
 * }
 * ```
 *
 * For performance reasons `useRemirror` does not automatically trigger a
 * rerender on every editor update. This allows for you use it in component
 * which don't need to track the latest editor state, without suffering a
 * performance penalty.
 *
 * However if you do want to track whether a command is enabled at the current
 * selection or whether a certain formatting mark (bold) is active at the
 * current selection you can pass through an optional parameter.
 *
 * ```
 * const { active, commands } = useRemirror({ autoUpdate: true });
 *
 * return (
 *   <button style={{ fontWeight: active.bold() ? 'bold' : undefined }}>
 *     B
 *   <button>
 * )
 * ```
 *
 * The above example keep track of whether the current selection is bold on
 * every update to the editor. Updates can be document changes and selection
 * changes.
 *
 * For more control you can also use a handler function as the first parameter
 * to selectively rerender as you see fit.
 *
 * ```
 * const { active, commands } = useRemirror(() => {
 *   if (active.bold() === boldActive) {
 *     return;
 *   }
 *
 *   setBoldActive(active.bold());
 * });
 *
 * const [boldActive, setBoldActive] = useState(active.bold());
 *
 * return (
 *   <button style={{ fontWeight: boldActive ? 'bold' : undefined }}>
 *     B
 *   <button>
 * )
 * ```
 *
 * In this case the component only re-renders when the bold formatting is no
 * longer active.
 */
export function useRemirror<Combined extends AnyCombinedUnion = DefaultReactCombined>(
  handler?: RemirrorEventListener<Combined> | { autoUpdate: boolean },
): ReactFrameworkOutput<Combined> {
  // This is not null when rendering within the `RemirrorProvider`. The majority
  // of times this is called, this will be the case.
  const editorContext = useContext(RemirrorContext) as ReactFrameworkOutput<Combined> | null;

  // This is not null when rendering within the `PortalContext` for custom node
  // views and custom decorations.
  const portalContext = usePortalContext() as ReactFrameworkOutput<Combined> | null;

  // A helper for forcing an update of the state.
  const forceUpdate = useRef(useForceUpdate());

  // Pick the correct context to use.
  const context = editorContext ?? portalContext;

  // Throw an error if context doesn't exist.
  invariant(context, { code: ErrorConstant.REACT_PROVIDER_CONTEXT });

  // Destructure the `addHandler` to minimise updates in the `useEffect` hook.
  const { addHandler } = context;

  // Manages the update frequency of this hook.
  useEffect(() => {
    let updateHandler = handler;

    // Default state, do nothing.
    if (!updateHandler) {
      return;
    }

    // Use the `forceUpdate` handler when `autoUpdate` is true.
    if (isPlainObject(updateHandler)) {
      const { autoUpdate } = updateHandler;
      updateHandler = autoUpdate ? () => forceUpdate.current() : undefined;
    }

    if (!isFunction(updateHandler)) {
      return;
    }

    // Add the update handler which will update this hook every time the editor
    // is updated.
    return addHandler('updated', updateHandler);
  }, [addHandler, handler]);

  return context;
}

export function useI18n(): I18nContextProps {
  const context = useContext(I18nContext);

  // Throw an error if no context exists.
  invariant(context, { code: ErrorConstant.I18N_CONTEXT });

  return context;
}

/**
 * This is a type alias for creating your own typed version of the remirror
 * method.
 *
 * ```ts
 * import { useRemirror, UseRemirrorType } from 'remirror/react';
 * import { SocialPreset } from 'remirror/preset/social'
 *
 * const useSocialRemirror = useRemirror as UseRemirrorType<SocialPreset>;
 *
 * // With the remirror provider context.
 * const Editor = () => {
 *   const { commands } = useSocialRemirror();
 *
 *   // All available commands are shown with intellisense. Command click to goto the implementation.
 *   commands.toggleBold();
 * }
 * ```
 */
export type UseRemirrorType<Combined extends AnyCombinedUnion> = <Type extends AnyCombinedUnion>(
  handler?: RemirrorEventListener<Combined> | { autoUpdate: boolean },
) => ReactFrameworkOutput<Combined | Type>;

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
 * This is only available within the context of the `RemirrorProvider` it will
 * throw an error otherwise.
 *
 * It can be used with three distinct call signatures.
 *
 * **Get the extension instance**
 *
 * ```tsx
 * import { useExtension } from 'remirror/react';
 * import { BoldExtension } from 'remirror/extension/bold';
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
 * import { useExtension } from 'remirror/react';
 * import { PlaceholderExtension } from 'remirror/extension/placeholder';
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
 * import { HistoryExtension, HistoryOptions } from 'remirror/extension/history';
 * import { useExtension } from 'remirror/react';
 *
 * const EditorPlaceholder = ({ placeholder = 'Your magnum opus' }) => {
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
 * These hooks can serve as the building blocks when customising your editor
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
  const { getExtension } = useRemirror();
  const extension = useMemo(() => getExtension(Constructor), [Constructor, getExtension]);

  // Handle the case where an options object is passed in.
  useEffectWithWarning(() => {
    if (isFunction(optionsOrCallback) || !optionsOrCallback) {
      return;
    }

    extension.setOptions(optionsOrCallback);
  }, [extension, optionsOrCallback]);

  useEffectWithWarning(() => {
    if (!isFunction(optionsOrCallback)) {
      return;
    }

    return optionsOrCallback({
      addHandler: extension.addHandler.bind(extension),
      addCustomHandler: extension.addCustomHandler.bind(extension),
      extension,
    });
  }, [extension, optionsOrCallback, ...dependencies]);

  // Return early when no extension available.
  if (optionsOrCallback) {
    return;
  }

  return extension;
}

interface UseExtensionCallbackParameter<Type extends AnyExtensionConstructor> {
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
  parameter: UseExtensionCallbackParameter<Type>,
) => Dispose | undefined;

/**
 * Update preset properties dynamically while the editor is still running.
 *
 * Only provide the Constructor in order to be given the unique preset instance
 * within the editor.
 */
export function usePreset<Type extends AnyPresetConstructor>(Constructor: Type): InstanceType<Type>;
export function usePreset<Type extends AnyPresetConstructor>(
  Constructor: Type,
  options: DynamicOptionsOfConstructor<Type>,
): void;
export function usePreset<Type extends AnyPresetConstructor>(
  Constructor: Type,
  method: UsePresetCallback<Type>,
  dependencies: DependencyList,
): void;
export function usePreset<Type extends AnyPresetConstructor>(
  Constructor: Type,
  optionsOrCallback:
    | DynamicOptionsOfConstructor<Type>
    | UsePresetCallback<Type>
    // eslint-disable-next-line unicorn/no-useless-undefined
    | undefined = undefined,
  dependencies: DependencyList = [],
): InstanceType<Type> | void {
  const { getPreset } = useRemirror();

  const preset = useMemo(() => getPreset(Constructor), [Constructor, getPreset]);

  useEffectWithWarning(() => {
    if (isFunction(optionsOrCallback) || !optionsOrCallback) {
      return;
    }

    preset.setOptions(optionsOrCallback);
  }, [preset, optionsOrCallback]);

  useEffectWithWarning(() => {
    if (!isFunction(optionsOrCallback)) {
      return;
    }

    return optionsOrCallback({
      addHandler: preset.addHandler.bind(preset),
      addCustomHandler: preset.addCustomHandler.bind(preset),
      preset,
    });
  }, [preset, optionsOrCallback, ...dependencies]);

  // Return early when the options or callback parameter is provided.
  if (optionsOrCallback) {
    return;
  }

  return preset;
}

interface UsePresetCallbackParameter<Type extends AnyPresetConstructor> {
  /**
   * Add a handler to the the preset callback.
   *
   * ```ts
   * addHandler('onChange', () => log('changed'));
   * ```
   */
  addHandler: AddHandler<OptionsOfConstructor<Type>>;

  /**
   * Set the value of a custom option which returns a dispose method.
   */
  addCustomHandler: CustomHandlerMethod<OptionsOfConstructor<Type>>;

  /**
   * An instance of the preset. This should only be needed in advanced
   * situations.
   */
  preset: InstanceType<Type>;
}

type UsePresetCallback<Type extends AnyPresetConstructor> = (
  parameter: UsePresetCallbackParameter<Type>,
) => Dispose | undefined;

/**
 * A hook for creating the editor manager directly in the react component.
 *
 * @remarks
 *
 * The manager is a singleton and doesn't rerender until `manager.destroy()` is
 * called. You should call this method in a `useEffect`
 *
 * This is intentional. However, it's something that can be addressed if it
 * causes issues.
 *
 * ```tsx
 * import { useExtension } from 'remirror/react';
 * import { PresetCore } from 'remirror/preset-core';
 * import { BoldExtension } from 'remirror/extension-bold';
 *
 * const Framework = () => {
 *   const manager = useManager([new BoldExtension(), new CorePreset()]);
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 */
export function useManager<Combined extends AnyCombinedUnion>(
  combined: Combined[] | (() => Combined[]) | RemirrorManager<ReactCombinedUnion<Combined>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactCombinedUnion<Combined>> {
  // Store the value in refs so that they can be used in the `useEffect` hook
  // without being passed as dependencies.
  const combinedRef = useRef(combined);
  const optionsRef = useRef(options);

  const [manager, setManager] = useState(() => createReactManager(combined, options));

  // Keep the parameter refs up to date with the latest value.
  combinedRef.current = combined;
  optionsRef.current = options;

  // Add a manager destroyed listener to only cleanup the manager when it is
  // destroyed.
  useEffect(() => {
    return manager.addHandler('destroy', () => {
      // `clone` is used to ensure that that any stale extensions are
      // reinitialized.
      setManager(() => createReactManager(combinedRef.current, optionsRef.current).clone());
    });
  }, [manager]);

  return manager;
}

export type BaseReactCombinedUnion = ReactPreset | CorePreset | BuiltinPreset;
