import {
  DependencyList,
  RefCallback,
  useCallback,
  useContext,
  useEffect,
  useMemo,
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
  isRemirrorManager,
  OptionsOfConstructor,
  RemirrorEventListener,
  RemirrorManager,
} from '@remirror/core';
import {
  getInitialPosition,
  Positioner,
  PositionerChangeHandlerMethod,
  PositionerChangeHandlerParameter,
  PositionerExtension,
  StringPositioner,
} from '@remirror/extension-positioner';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

import { I18nContext, RemirrorContext } from '../react-contexts';
import { createReactManager } from '../react-helpers';
import {
  CreateReactManagerOptions,
  I18nContextProps,
  ReactCombinedUnion,
  RemirrorContextProps,
} from '../react-types';
import { useEffectWithWarning } from './core-hooks';

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
  const [, setState] = useState({});

  invariant(context, { code: ErrorConstant.REACT_PROVIDER_CONTEXT });

  useEffect(() => {
    let updateHandler = handler;

    if (!updateHandler) {
      return;
    }

    if (!isFunction(updateHandler)) {
      const { autoUpdate } = updateHandler;

      updateHandler = autoUpdate ? () => setState({}) : undefined;
    }

    if (!isFunction(updateHandler)) {
      return;
    }

    return context.addHandler('updated', updateHandler);
  }, [handler, context]);

  return context;
}

export function useI18n(): I18nContextProps {
  const context = useContext(I18nContext);

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
 *   // All commands are autocompleted for you.
 *   commands.toggleBold();
 * }
 * ```
 */
export type UseRemirrorType<Combined extends AnyCombinedUnion> = <Type extends AnyCombinedUnion>(
  onChange?: RemirrorEventListener<Combined>,
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
      addHandler: extension.addHandler,
      addCustomHandler: extension.addCustomHandler,
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
      addHandler: preset.addHandler,
      addCustomHandler: preset.addCustomHandler,
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
  managerOrCombined: readonly Combined[] | RemirrorManager<ReactCombinedUnion<Combined>>,
  options: CreateReactManagerOptions = {},
): RemirrorManager<ReactCombinedUnion<Combined>> {
  // The manager value for the next update. It is only applied on the first
  // render and when the previous manager has been destroyed.
  const nextManager = isRemirrorManager<ReactCombinedUnion<Combined>>(managerOrCombined)
    ? managerOrCombined
    : createReactManager(managerOrCombined, options);

  const [manager, setManager] = useState(nextManager);

  useEffect(() => {
    return manager.addHandler('destroy', () => {
      setManager(nextManager.clone());
    });
  }, [manager, nextManager]);

  return manager;
}

export type BaseReactCombinedUnion = ReactPreset | CorePreset | BuiltinPreset;

export type UsePositionerHookReturn = PositionerChangeHandlerParameter & {
  /**
   * This ref must be applied to the component that is being positioned in order
   * to correctly obtain the position data.
   */
  ref: RefCallback<HTMLElement>;
};

/**
 * A shorthand tool for creating a positioner with the `PositionerExtension`.
 *
 * Must apply the ref to the component when called.
 *
 * @remarks
 *
 * ```ts
 * import { usePositioner } from '@remirror/react';
 *
 * const MenuComponent: FC = () => {
 *   const {
 *     ref,
 *     active,
 *     bottom,
 *     left,
 *   } = usePositioner('bubble');
 *
 *   return (
 *     <div style={{ bottom, left }} ref={ref}>
 *       <MenuIcon {...options} />
 *     </div>
 *   );
 * }
 *
 * <RemirrorProvider extensions={[]}>
 *   <MenuComponent />
 * </RemirrorProvider>
 * ```
 */
export function usePositioner(
  positioner: Positioner | StringPositioner,
  onChange?: PositionerChangeHandlerMethod,
): UsePositionerHookReturn {
  const [element, setElement] = useState<HTMLElement>();
  const [state, setState] = useState<PositionerChangeHandlerParameter>({
    ...getInitialPosition(positioner),
    active: false,
  });

  const ref: RefCallback<HTMLElement> = useCallback((instance) => {
    if (instance) {
      setElement(instance);
    }
  }, []);

  const onChangeHandler: PositionerChangeHandlerMethod = useCallback(
    (parameter) => {
      setState(parameter);
      onChange?.(parameter);
    },
    [onChange],
  );

  useExtension(
    PositionerExtension,
    useCallback(
      (parameter) => {
        if (!element) {
          return;
        }

        const { addCustomHandler } = parameter;
        const dispose = addCustomHandler('positionerHandler', {
          element,
          positioner,
          onChange: onChangeHandler,
        });

        return dispose;
      },
      [element, onChangeHandler, positioner],
    ),
    [positioner, element],
  );

  return { ...state, ref };
}
