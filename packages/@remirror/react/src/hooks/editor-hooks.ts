import {
  DependencyList,
  RefCallback,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

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
import {
  ElementsAddedParameter,
  emptyVirtualPosition,
  getPositioner,
  Positioner,
  PositionerExtension,
  StringPositioner,
  VirtualPosition,
} from '@remirror/extension-positioner';
import type { CorePreset } from '@remirror/preset-core';
import type { ReactPreset } from '@remirror/preset-react';

import { I18nContext, RemirrorContext } from '../react-contexts';
import { createReactManager } from '../react-helpers';
import type {
  CreateReactManagerOptions,
  I18nContextProps,
  ReactCombinedUnion,
  RemirrorContextProps,
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
export function useRemirror<Combined extends AnyCombinedUnion>(
  handler?: RemirrorEventListener<Combined> | { autoUpdate: boolean },
): RemirrorContextProps<Combined> {
  const context = useContext(RemirrorContext);
  const forceUpdate = useForceUpdate();

  // Throw an error if context doesn't exist.
  invariant(context, { code: ErrorConstant.REACT_PROVIDER_CONTEXT });

  useEffect(() => {
    let updateHandler = handler;

    if (!updateHandler) {
      return;
    }

    if (isPlainObject(updateHandler)) {
      const { autoUpdate } = updateHandler;
      updateHandler = autoUpdate ? () => forceUpdate() : undefined;
    }

    if (!isFunction(updateHandler)) {
      return;
    }

    return context.addHandler('updated', updateHandler);
  }, [handler, context, forceUpdate]);

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
) => RemirrorContextProps<Combined | Type>;

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
 * ```ts
 * import React, { useCallback, useState } from 'react';
 * import { useExtension } from 'remirror/react';
 * import { MentionExtension } from 'remirror/extension/mention';
 *
 * const FloatingQueryText = () => {
 *   const [query, setQuery] = useState('');
 *   const onChange = useCallback(({ query }) => setQuery(query.full), [setQuery]);
 *
 *   useExtension(MentionExtension, { appendText: 'hello' });
 *
 *   useExtension()
 *
 *   return <p>{query}</p>
 * }
 * ```
 *
 * The above example would add the `onChange` handler property to the extension.
 *
 * TODO - What about using this multiple times how could the extension handle
 * that?
 */
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
  optionsOrCallback: DynamicOptionsOfConstructor<Type> | UseExtensionCallback<Type>,
  dependencies: DependencyList = [],
): void {
  const { getExtension } = useRemirror();
  const extension = useMemo(() => getExtension(Constructor), [Constructor, getExtension]);

  // Handle the case where it an options object passed in.
  useEffectWithWarning(() => {
    if (isFunction(optionsOrCallback)) {
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
 */
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
  optionsOrCallback: DynamicOptionsOfConstructor<Type> | UsePresetCallback<Type>,
  dependencies: DependencyList = [],
): void {
  const { getPreset } = useRemirror();

  const preset = useMemo(() => getPreset(Constructor), [Constructor, getPreset]);

  useEffectWithWarning(() => {
    if (isFunction(optionsOrCallback)) {
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
   * An instance of the preset. This should only be needed in advanced situations.
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
 * The manager is a singleton and doesn't rerender until `manager.destroy()` is called.
 * You should call this method in a `useEffect`
 *
 * This is intentional. However, it's something that can be addressed
 * if it causes issues.
 *
 * ```tsx
 * import { useExtension } from '@remirror/react';
 * import { PresetCore } from '@remirror/preset-core';
 * import { BoldExtension } from '@remirror/extension-bold';
 *
 * const EditorWrapper = () => {
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
  const combinedRef = useRef(combined);
  const optionsRef = useRef(options);

  // The initial manager which will never be updated.
  const initialManager = useMemo(() => {
    return createReactManager(combinedRef.current, optionsRef.current);
  }, []);

  const [manager, setManager] = useState(initialManager);

  combinedRef.current = combined;
  optionsRef.current = options;

  useEffect(() => {
    return manager.addHandler('destroy', () => {
      // `clone` is used to ensure that that any stale extensions are
      // reinitialized.
      setManager(createReactManager(combinedRef.current, optionsRef.current).clone());
    });
  }, [manager, initialManager]);

  return manager;
}

export type BaseReactCombinedUnion = ReactPreset | CorePreset | BuiltinPreset;

export interface UsePositionerHookReturn extends VirtualPosition {
  /**
   * This ref must be applied to the component that is being positioned in order
   * to correctly obtain the position data.
   */
  ref: RefCallback<HTMLElement>;

  element?: HTMLElement;
  key: string;
}

/**
 * A hook for creating a positioner with the `PositionerExtension`. When an
 * active position exists for the provided positioner it will return an object
 * with the `ref`, `top`, `left`, `bottom`, `right` properties.
 *
 *
 * @remarks
 *
 * Must apply the ref to the component when called.
 *
 * ```ts
 * import { usePositioner } from 'remirror/react';
 *
 * const MenuComponent: FC = () => {
 *   const positions = usePositioner('bubble');
 *
 *   return (
 *     <div style={{ bottom, left }} ref={ref}>
 *       <MenuIcon {...options} />
 *     </div>
 *   );
 * }
 *
 * const Wrapper = () => (
 *   <RemirrorProvider extensions={[]}>
 *     <MenuComponent />
 *   </RemirrorProvider>
 * )
 * ```
 */
export function usePositioner(
  positioner: Positioner | StringPositioner,
): Partial<UsePositionerHookReturn> {
  const positions = useMultiPositioner(positioner);

  if (positions.length > 0) {
    return positions[0];
  }

  return {};
}

/**
 * A positioner for your editor. This returns an array of active positions and
 * is useful for tracking the positions of multiple items in the editor.
 *
 * ```ts
 * import { Positioner } from 'remirror/extension/positioner
 * import { useMultiPositioner } from 'remirror/react';
 *
 * const positioner = Positioner.create({
 *   ...config, // custom config
 * })
 *
 * const MenuComponent: FC = () => {
 *   const positions = usePositioner(positioner);
 *
 *   return (
 *     <>
 *       {
 *         positions.map(({ ref, bottom, left, key }) => (
 *           <div style={{ bottom, left }} ref={ref} key={key}>
 *             <MenuIcon {...options} />
 *           </div>
 *         )
 *       }
 *     </>
 *   )
 * }
 * ```
 */
export function useMultiPositioner(
  positioner: Positioner | StringPositioner,
): UsePositionerHookReturn[] {
  interface CollectElementRef {
    ref: RefCallback<HTMLElement>;
    id: string;
  }

  const [state, setState] = useState<ElementsAddedParameter[]>([]);
  const memoizedPositioner = useMemo(() => getPositioner(positioner), [positioner]);
  const [collectRefs, setCollectRefs] = useState<CollectElementRef[]>([]);

  useExtension(
    PositionerExtension,
    useCallback(
      (parameter) => {
        const { addCustomHandler } = parameter;
        return addCustomHandler('positioner', memoizedPositioner);
      },
      [memoizedPositioner],
    ),
    [],
  );

  // Add the positioner update handlers.
  useEffect(() => {
    const disposeUpdate = memoizedPositioner.addListener('update', (parameter) => {
      const items: CollectElementRef[] = [];

      for (const { id, setElement } of parameter) {
        const ref: RefCallback<HTMLElement> = (element) => {
          if (!element) {
            return;
          }

          setElement(element);
        };

        items.push({ id, ref });
      }

      setCollectRefs(items);
    });

    const disposeElementsAdded = memoizedPositioner.addListener('done', (parameter) => {
      setState(parameter);
    });

    return () => {
      disposeUpdate();
      disposeElementsAdded();
    };
  }, [memoizedPositioner]);

  return collectRefs.map(({ ref, id: key }, index) => {
    const { element, position } = state[index] ?? {};
    const virtualPosition = { ...emptyVirtualPosition, ...position };
    const virtualNode = memoizedPositioner.getVirtualNode(virtualPosition);

    return { ref, element, key, virtualNode, ...position };
  });
}
