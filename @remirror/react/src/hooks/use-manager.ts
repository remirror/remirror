import { useMemo, useRef } from 'react';

import {
  AnyExtension,
  AnyPreset,
  EditorManager,
  EditorManagerParameter,
  keys,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ReactPreset } from '@remirror/preset-react';

function arePropertiesEqual<Type extends object>(value: Type, compare?: Type) {
  if (compare === undefined) {
    return false;
  }

  return keys(value).every((key) => compare[key]);
}

/**
 * Takes an object and checks that each of it's keys are different
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
 *   const manager = useManager([corePreset, boldExtension]);
 *
 *   <RemirrorProvider >
 *     <MyEditor />
 *   </RemirrorProvider>;
 * }
 * ```
 */
export function useManager<ExtensionUnion extends AnyExtension, PresetUnion extends AnyPreset>(
  parameter: EditorManagerParameter<ExtensionUnion, PresetUnion>,
) {
  const { extensions } = parameter;
  const settings = useObjectCheck(parameter.settings ?? {});
  const presets = useMemo(() => [...parameter.presets, new CorePreset(), new ReactPreset()], [
    parameter.presets,
  ]);

  return useMemo(() => EditorManager.create({ extensions, settings, presets }), [
    extensions,
    settings,
    presets,
  ]);
}
