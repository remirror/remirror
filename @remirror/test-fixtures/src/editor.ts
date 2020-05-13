import {
  EditorManager,
  object,
  AnyExtension,
  AnyPreset,
  GetConstructor,
  Of,
  GetExtensionUnion,
  GetNodeNameUnion,
  GetMarkNameUnion,
  AnyNodeExtension,
} from '@remirror/core';
import { CorePreset } from '@remirror/preset-core';
import { ParagraphExtension } from '@remirror/extension-paragraph';
import { BoldExtension } from '@remirror/extension-bold';
import { NodeType } from '@remirror/pm/model';

/**
 * A manager used for testing with the preset core already applied.
 */
export function createBaseManager<
  ExtensionUnion extends AnyExtension,
  PresetUnion extends AnyPreset<ExtensionUnion>
>(
  extensionOrPresetList: Array<ExtensionUnion | PresetUnion>,
  settings: Remirror.ManagerSettings = object(),
) {
  const corePreset = CorePreset.of();
  const paragraphExtension = ParagraphExtension.of();
  const boldExtension = BoldExtension.of();

  const manager = EditorManager.of([...extensionOrPresetList, corePreset], settings);
  manager.nodes;

  return manager;
}

const corePreset = CorePreset.of();
const paragraphExtension = ParagraphExtension.of();
const boldExtension = BoldExtension.of();
const manager = EditorManager.of({
  extensions: [paragraphExtension, boldExtension],
  // presets: [corePreset],
});
manager.nodes;
manager.store.helpers;
manager.marks;
manager.extensions.map((ext) => ext);

type Ext = typeof manager['~E'];
type Names = Get<Ext>;
type Get<Extension extends AnyExtension> = Extension extends AnyNodeExtension
  ? Extension['name']
  : never;
