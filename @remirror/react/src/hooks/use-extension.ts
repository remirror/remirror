import { useMemo } from 'react';
import useDeepCompareEffect from 'use-deep-compare-effect';

import {
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
 * ```ts
 * import { useExtensionInstance, usePresetInstance } from 'remirror/react';
 * import { PresetCore } from 'remirror/preset-core';
 * import { BoldExtension } from 'remirror/extension-bold';
 *
 * const EditorWrapper = () => {
 *   const corePreset = usePresetInstance(PresetCore);
 *   const boldExtension = useExtensionInstance(BoldExtension, { weight: 700 });
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
export function useExtensionInstance<Type extends AnyExtensionConstructor>(
  Constructor: Type,
  ...[settings]: ExtensionConstructorParameter<
    SettingsOfConstructor<Type>,
    PropertiesOfConstructor<Type>
  >
) {
  return useMemo(() => new Constructor(settings), [Constructor, settings]);
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
 *   useExtension(MentionExtension, { onChange });
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
  properties: PropertiesOfConstructor<Type>,
) {
  const { manager } = useRemirror();

  const extension = useMemo(() => manager.getExtension(Constructor), [Constructor, manager]);

  useDeepCompareEffect(() => {
    extension.setProperties(properties);
  }, [extension, properties]);
}
