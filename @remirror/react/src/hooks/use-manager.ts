import { useMemo, useRef } from 'react';

import { AnyExtension, AnyPreset, EditorManager, keys } from '@remirror/core';

function arePropertiesEqual<Type extends object>(value: Type, compare?: Type) {
  if (compare === undefined) {
    return false;
  }

  return keys(value).every((key) => compare[key]);
}

/**
 * Takes an object check that each of it's keys are different
 */
function useParameter<Type extends object>(parameter: Type): Type {
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
 *   const manager = useManager([corePreset, boldExtension]);
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 */
export const useManager = <
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
>(
  extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
  settings: Remirror.ManagerSettings,
) => {
  const parameter = useParameter(settings);

  return useMemo(() => EditorManager.of(extensionOrPresetList, parameter), [
    extensionOrPresetList,
    parameter,
  ]);
};
