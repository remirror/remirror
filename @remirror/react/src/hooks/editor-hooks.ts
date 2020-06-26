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
import useDeepCompareEffect from 'use-deep-compare-effect';

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
  keys,
  OptionsOfConstructor,
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
import { I18nContextProps, RemirrorContextProps } from '../react-types';

/**
 * This provides access to the Remirror Editor context using hooks.
 *
 * @remarks
 *
 * The following example takes the position props from
 * ```ts
 * import { RemirrorProvider, useRemirror } from 'remirror';
 *
 * const HooksComponent = (props) => {
 *   // This pulls the remirror props out from the context.
 *   const { getPositionerProps } = useRemirror();
 *
 *   return <Menu {...getPositionerProps()} />;
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
 */
export function useRemirror<Combined extends AnyCombinedUnion>(): RemirrorContextProps<Combined> {
  const context = useContext(RemirrorContext);

  invariant(context, { code: ErrorConstant.REACT_PROVIDER_CONTEXT });

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
export type UseRemirrorType<Combined extends AnyCombinedUnion> = () => RemirrorContextProps<
  Combined
>;

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
  const { manager } = useRemirror();
  const extension = useMemo(() => manager.getExtension(Constructor), [Constructor, manager]);

  // Handle the case where it an options object passed in.
  useDeepCompareEffect(() => {
    if (isFunction(optionsOrCallback)) {
      return;
    }

    extension.setOptions(optionsOrCallback);
  }, [extension, optionsOrCallback]);

  const memoizedDependencies = useObjectCheck(dependencies);

  useDeepCompareEffect(() => {
    if (!isFunction(optionsOrCallback)) {
      return;
    }

    return optionsOrCallback({
      addHandler: extension.addHandler,
      addCustomHandler: extension.addCustomHandler,
      extension,
    });
  }, [extension, optionsOrCallback, memoizedDependencies]);
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

type UseExtensionCallback<Type extends AnyExtensionConstructor> = (
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
  const { manager } = useRemirror();

  const preset = useMemo(() => manager.getPreset(Constructor), [Constructor, manager]);

  useDeepCompareEffect(() => {
    if (isFunction(optionsOrCallback)) {
      return;
    }

    preset.setOptions(optionsOrCallback);
  }, [preset, optionsOrCallback]);

  const memoizedDependencies = useObjectCheck(dependencies);

  useDeepCompareEffect(() => {
    if (!isFunction(optionsOrCallback)) {
      return;
    }

    return optionsOrCallback({
      addHandler: preset.addHandler,
      addCustomHandler: preset.addCustomHandler,
      preset,
    });
  }, [preset, optionsOrCallback, memoizedDependencies]);
}

function arePropertiesEqual<Type extends object>(value: Type, compare?: Type) {
  if (compare === undefined) {
    return false;
  }

  return keys(value).every((key) => compare[key]);
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
 * Takes an object and checks if any of it's properties are different from previously
 */
function useObjectCheck<Type extends object>(parameter: Type): Type {
  const ref = useRef<Type>();

  if (!ref.current || !arePropertiesEqual(parameter, ref.current)) {
    ref.current = parameter;
  }

  return ref.current;
}

type ManagerOrCombined<Combined extends AnyCombinedUnion> =
  | Combined
  | ReactPreset
  | CorePreset
  | BuiltinPreset;

/**
 * A hook for creating the editor manager directly in the react component.
 *
 * @remarks
 *
 * The manager is a singleton and doesn't rerender for the lifetime of the
 * component. This is intentional. However, it's something that can be addressed
 * if it causes issues.
 *
 * ```tsx
 * import { useExtension } from '@remirror/react';
 * import { PresetCore } from '@remirror/preset-core';
 * import { BoldExtension } from '@remirror/extension-bold';
 *
 * const EditorWrapper = () => {
 *   const corePreset = usePreset(PresetCore);
 *   const boldExtension = useExtension(BoldExtension);
 *   const manager = useManager({ extension: [boldExtension], presets: [] });
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 */
export function useManager<Combined extends AnyCombinedUnion>(
  managerOrCombined: readonly Combined[] | RemirrorManager<ManagerOrCombined<Combined>>,
  settings: Remirror.ManagerSettings = {},
): RemirrorManager<ManagerOrCombined<Combined>> {
  const ref = useRef(
    isRemirrorManager<ManagerOrCombined<Combined>>(managerOrCombined)
      ? managerOrCombined
      : createReactManager(managerOrCombined, settings),
  );
  const isNewManager = !isRemirrorManager<ManagerOrCombined<Combined>>(managerOrCombined);

  useEffect(() => {
    if (isNewManager) {
      return () => {
        ref.current.destroy();
      };
    }
    return;
  }, [isNewManager]);

  return ref.current;
}

export type BaseReactCombinedUnion = ReactPreset | CorePreset | BuiltinPreset;

export type UsePositionerHookReturn = PositionerChangeHandlerParameter & {
  ref: RefCallback<HTMLElement>;
};

/**
 * A shorthand tool for creating a positioner with the `PositionerExtension`
 * applied via .
 *
 * @remarks
 *
 * ```ts
 * import { usePositioner } from '@remirror/react';
 *
 * const MenuComponent: FC = () => {
 *
 *   const onChange = ({active, bottom, left}) => {
 *     re
 *   }
 *
 *   const {
 *     active,
 *     bottom,
 *     left
 * } = usePositioner({positioner });
 *
 *   return (
 *     <div style={{ bottom, left }}>
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
    [positioner, element],
  );

  return { ...state, ref };
}

/**
 * Create a react manager with all the default react presets and extensions.
 */
export function createReactManager<Combined extends AnyCombinedUnion>(
  combined: readonly Combined[],
  settings: Remirror.ManagerSettings = {},
): RemirrorManager<Combined | BuiltinPreset | ReactPreset | CorePreset> {
  return RemirrorManager.create([...combined, new ReactPreset(), new CorePreset()], settings);
}
