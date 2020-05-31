import { DependencyList, useContext, useMemo, useRef } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  AddCustomHandler,
  AddHandler,
  AnyCombinedUnion,
  AnyExtensionConstructor,
  AnyPresetConstructor,
  BuiltinPreset,
  Dispose,
  DynamicOptionsOfConstructor,
  EditorManager,
  ErrorConstant,
  ExtensionConstructorParameter,
  invariant,
  isFunction,
  keys,
  OptionsOfConstructor,
  PresetConstructorParameter,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

import { RemirrorContext } from '../react-contexts';
import { RemirrorContextProps, UsePositionerParameter } from '../react-types';

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

/**
 * A react hook for for creating an extension within the editor.
 *
 * @remarks
 *
 * This can be useful if you'd like to create your extensions and `EditorManager`
 * within a react component.
 *
 * @example
 *
 * ```ts
 * import { useCreateExtension, useCreatePreset } from 'remirror/react';
 * import { PresetCore } from 'remirror/preset-core';
 * import { BoldExtension } from 'remirror/extension-bold';
 *
 * const EditorWrapper = () => {
 *   const corePreset = useCreatePreset(PresetCore);
 *   const boldExtension = useCreateExtension(BoldExtension, { weight: 700 });
 *   const manager = useManager([corePreset, boldExtension]);
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 *
 * You'll probably only need to work this way if you expect to dynamically
 * switch out the editor multiple times in apps like the
 * `@remirror/playground`.
 */
export function useCreateExtension<Type extends AnyExtensionConstructor>(
  Constructor: Type,
  ...[options]: ExtensionConstructorParameter<OptionsOfConstructor<Type>>
) {
  return useMemo(() => new Constructor(options), [Constructor, options]) as InstanceType<Type>;
}

/**
 * A react hook for for creating a preset within the editor.
 *
 * @remarks
 *
 * This can be useful if you'd like to create your presets and `EditorManager`
 * within a react component.
 *
 * @example
 *
 * ```ts
 * import { useCreateExtension, useCreatePreset } from 'remirror/react';
 * import { PresetCore } from 'remirror/preset-core';
 * import { BoldExtension } from 'remirror/extension-bold';
 *
 * const EditorWrapper = () => {
 *   const corePreset = useCreatePreset(PresetCore);
 *   const boldExtension = useCreateExtension(BoldExtension, { weight: 700 });
 *   const manager = useManager({extension: [boldExtension], presets: [] });
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 *
 * You'll probably only need to work this way if you expect to dynamically
 * switch out the editor multiple times in apps like the
 * `@remirror/playground`.
 */
export function useCreatePreset<Type extends AnyPresetConstructor>(
  Constructor: Type,
  ...[settings]: PresetConstructorParameter<OptionsOfConstructor<Type>>
) {
  return useMemo(() => new Constructor(settings), [Constructor, settings]) as InstanceType<Type>;
}

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
   * addHandler('onChange', () => console.log('changed'));
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
  addCustomHandler: AddCustomHandler<OptionsOfConstructor<Type>>;

  /**
   * An instance of the extension. This can be used for more advanced scenarios.
   */
  extension: InstanceType<Type>;
}

type UseExtensionCallback<Type extends AnyExtensionConstructor> = (
  parameter: UseExtensionCallbackParameter<Type>,
) => Dispose;

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
   * addHandler('onChange', () => console.log('changed'));
   * ```
   */
  addHandler: AddHandler<OptionsOfConstructor<Type>>;

  /**
   * Set the value of a custom option which returns a dispose method.
   */
  addCustomHandler: AddCustomHandler<OptionsOfConstructor<Type>>;

  /**
   * An instance of the preset. This should only be needed in advanced situations.
   */
  preset: InstanceType<Type>;
}

type UsePresetCallback<Type extends AnyPresetConstructor> = (
  parameter: UsePresetCallbackParameter<Type>,
) => Dispose;

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

/**
 * A hook for creating the editor manager directly in the react component.
 *
 * @remarks
 *
 * This might be helpful when creating tools like the `@remirror/playground`
 * which need to rerender the editor with different settings and can also
 * manager errors.
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
  combined: Combined[],
  settings: Remirror.ManagerSettings = {},
): EditorManager<Combined | ReactPreset | CorePreset | BuiltinPreset> {
  const extensionsAndPresets = useMemo(() => [...combined, new CorePreset(), new ReactPreset()], [
    combined,
  ]);

  return useMemo(() => EditorManager.fromList(extensionsAndPresets, settings), [
    extensionsAndPresets,
    settings,
  ]);
}

export type BaseReactCombinedUnion = ReactPreset | CorePreset | BuiltinPreset;

/**
 * A shorthand tool for retrieving the positioner props and adding them to a component.
 *
 * @remarks
 *
 * ```ts
 * import { bubblePositioner } from '@remirror/react';
 *
 * const MenuComponent: FC = () => {
 *   const {
 *     isActive,
 *     bottom,
 *     left
 * } = usePositioner({positionerId: 'bubbleMenu', positioner: bubblePositioner });
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
export function usePositioner<Ref extends string = 'ref'>({
  positioner,
  ...rest
}: UsePositionerParameter<Ref>) {
  const { getPositionerProps } = useRemirror();

  return getPositionerProps<Ref>({ ...positioner, ...rest });
}
