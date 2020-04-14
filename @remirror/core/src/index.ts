export { BuiltinPreset, builtInExtensions } from './builtins';
export type { BuiltInExtensions } from './builtins';

export {
  ExtensionFactory,
  isExtension,
  isExtensionConstructor,
  isMarkExtension,
  isNodeExtension,
  isPlainExtension,
} from './extension';
export type {
  AnyExtension,
  AnyExtensionConstructor,
  AnyMarkExtension,
  AnyNodeExtension,
  AnyPlainExtension,
  Extension,
  GetExtensionUnion,
  MarkExtension,
  NodeExtension,
  PlainExtension,
  ExtensionTags,
} from './extension';

export { EditorManager, isEditorManager } from './editor-manager';
export type { ManagerTransactionHandlerParameter } from './editor-manager';

export { PresetFactory, isPreset, isPresetConstructor } from './preset';
export type {
  GetPresetUnion,
  Preset,
  PresetConstructor,
  PresetListParameter,
  PresetParameter,
} from './preset';

export type {
  ExtensionCommandReturn,
  ExtensionHelperReturn,
  ManagerMethodParameter,
} from './types';
