import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
  AnyExtension,
  AnyExtensionConstructor,
  ExtensionConstructorParameter,
  PropertiesOfConstructor,
  SettingsOfConstructor,
} from '@remirror/core';

import { useRemirror } from './use-remirror';

/**
 * A react hook for for creating an extension within the editor. This ensures
 * that the editor
 *
 * @remarks
 *
 * This can be used if you'd like to create your extensions and EditorManager
 * within a react component.
 *
 * @example
 *
 * ```javascript
 * import { useExtension } from '@remirror/react';
 * import { PresetCore } from '@remirror/preset-core';
 * import { BoldExtension } from '@remirror/extension-bold';
 *
 * const EditorWrapper = () => {
 *   const corePreset = usePreset(PresetCore);
 *   const boldExtension = useExtension(BoldExtension, { weight: 700 });
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
export const useExtension = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  ...[settings]: ExtensionConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) => {
  return useMemo(() => Constructor.of(settings), [Constructor, settings]);
};

export const useExtensionProperties = <Type extends AnyExtensionConstructor>(
  Constructor: Type,
  properties: PropertiesOfConstructor<Type>,
) => {
  const { manager } = useRemirror();

  const extension: AnyExtension = useMemo(() => manager.getExtension(Constructor), [
    Constructor,
    manager,
  ]);

  useDeepCompareEffect(() => {
    extension.setProperties(properties);
  }, [extension, properties]);
};
